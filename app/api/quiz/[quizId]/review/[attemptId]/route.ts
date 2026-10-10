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
    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .select("id, title, description, show_score, show_review")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      console.error("quiz review: quiz lookup failed", quizError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    if (quiz.show_review === false) return NextResponse.json({ error: "Review is disabled for this quiz" }, { status: 403 });

    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status, score, started_at")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("quiz review: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt || attempt.quiz_id !== quizId) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status !== "submitted") return NextResponse.json({ error: "Review is available after submission" }, { status: 409 });

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("quiz review: mapping lookup failed", mappingsError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((row: any) => row.practice_question_id);
    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer")
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("quiz review: answers lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const { data: rawQuestions, error: questionsError } = await admin
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_option, explanation")
      .in("id", questionIds);

    if (questionsError) {
      console.error("quiz review: question lookup failed", questionsError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionMap = new Map((rawQuestions || []).map((question: any) => [question.id, question]));
    const questions = (mappings || []).map((mapping: any, index: number) => {
      const question: any = questionMap.get(mapping.practice_question_id);
      return question ? { ...question, correct_answer: question.correct_option, question_number: mapping.order_index ?? index + 1 } : null;
    }).filter(Boolean);

    const answerMap: Record<string, string | null> = {};
    (answers || []).forEach((answer: any) => {
      answerMap[answer.question_id] = answer.selected_option ?? answer.user_answer ?? null;
    });

    return NextResponse.json({ quiz, attempt, questions, answers: answerMap });
  } catch (err) {
    console.error("GET quiz review exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
