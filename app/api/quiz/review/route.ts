import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const attemptId = new URL(req.url).searchParams.get("attempt");
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status, score, started_at")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("review: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status !== "submitted") return NextResponse.json({ error: "Review is available after submission" }, { status: 409 });

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", attempt.quiz_id)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("review: mapping lookup failed", mappingsError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((row: any) => row.practice_question_id);
    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer, is_marked")
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("review: answer lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const { data: rawQuestions, error: questionsError } = await admin
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_option, explanation")
      .in("id", questionIds);

    if (questionsError) {
      console.error("review: question lookup failed", questionsError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionMap = new Map((rawQuestions || []).map((question: any) => [question.id, question]));
    const questions = (mappings || []).map((mapping: any, index: number) => {
      const question: any = questionMap.get(mapping.practice_question_id);
      return question ? {
        ...question,
        correct_answer: question.correct_option,
        question_number: mapping.order_index ?? index + 1,
      } : null;
    }).filter(Boolean);

    return NextResponse.json({
      attempt,
      answers: (answers || []).map((answer: any) => ({
        ...answer,
        user_answer: answer.user_answer ?? answer.selected_option,
      })),
      questions,
    });
  } catch (err) {
    console.error("GET /api/quiz/review exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
