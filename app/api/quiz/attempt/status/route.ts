import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const attemptId = searchParams.get("attempt") || searchParams.get("attemptId");
    if (!quizId || !attemptId) {
      return NextResponse.json({ error: "Missing quizId or attemptId" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("status: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt || attempt.quiz_id !== quizId) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status === "submitted") return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });

    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer, question_number, is_marked")
      .eq("attempt_id", attempt.id)
      .order("question_number", { ascending: true });

    if (answersError) {
      console.error("status: answers lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index, practice_questions(question, option_a, option_b, option_c, option_d)")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("status: question lookup failed", mappingsError);
      return NextResponse.json({ error: "Failed to load quiz questions" }, { status: 500 });
    }

    const questions = (mappings || []).map((row: any, index: number) => ({
      id: row.practice_question_id,
      question: row.practice_questions?.question || "",
      option_a: row.practice_questions?.option_a || "",
      option_b: row.practice_questions?.option_b || "",
      option_c: row.practice_questions?.option_c || "",
      option_d: row.practice_questions?.option_d || "",
      question_number: row.order_index ?? index + 1,
    }));

    return NextResponse.json({
      questions,
      answers: (answers || []).map((answer: any) => ({
        ...answer,
        user_answer: answer.user_answer ?? answer.selected_option,
      })),
    });
  } catch (err) {
    console.error("GET /api/quiz/attempt/status exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
