import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function GET(_req: NextRequest, ctx: any) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const params = await ctx.params;
    const quizId = typeof params?.quizId === "string" ? params.quizId : "";
    const attemptId = typeof params?.attemptId === "string" ? params.attemptId : "";
    if (!quizId || !attemptId) return NextResponse.json({ error: "Missing quizId or attemptId" }, { status: 400 });

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status, score, started_at")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("score: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt || attempt.quiz_id !== quizId) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status !== "submitted") return NextResponse.json({ error: "Score is available after submission" }, { status: 409 });

    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .select("id, title, description, show_score, show_review")
      .eq("id", quizId)
      .maybeSingle();
    if (quizError) {
      console.error("score: quiz lookup failed", quizError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const { data: mappings, error: mappingError } = await admin
      .from("quiz_questions")
      .select("practice_question_id")
      .eq("quiz_id", quizId);
    if (mappingError) {
      console.error("score: mapping lookup failed", mappingError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((row: any) => row.practice_question_id);
    if (!questionIds.length) return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });

    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer")
      .eq("attempt_id", attemptId);
    if (answersError) {
      console.error("score: answer lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const { data: questions, error: questionsError } = await admin
      .from("practice_questions")
      .select("id, correct_option")
      .in("id", questionIds);
    if (questionsError) {
      console.error("score: question lookup failed", questionsError);
      return NextResponse.json({ error: "Failed to score quiz" }, { status: 500 });
    }

    const answerMap = new Map<string, string>((answers || []).map((answer: any): [string, string] => [
      answer.question_id,
      String(answer.selected_option ?? answer.user_answer ?? "").trim().toUpperCase(),
    ]));
    const correctMap = new Map((questions || []).map((question: any) => [
      question.id,
      String(question.correct_option || "").trim().toUpperCase(),
    ]));

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    for (const questionId of questionIds) {
      const answer = answerMap.get(questionId);
      if (!answer) unanswered++;
      else if (answer === correctMap.get(questionId)) correct++;
      else wrong++;
    }

    return NextResponse.json({
      quiz,
      attempt,
      correct,
      wrong,
      unanswered,
      total: questionIds.length,
    });
  } catch (err) {
    console.error("GET quiz score exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
