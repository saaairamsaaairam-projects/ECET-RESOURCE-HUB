import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { params } = ctx;
    const { quizId, attemptId } = params || {};

    // 1. Fetch quiz
    const { data: quiz, error: quizErr } = await getAdminClient()
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      console.error("GET /api/quiz/[quizId]/review - quiz not found", quizErr);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // If show_review explicitly false, forbid
    if (quiz.show_review === false) {
      return NextResponse.json({ error: "Review is disabled for this quiz" }, { status: 403 });
    }

    // 2. Fetch attempt
    const { data: attempt, error: attemptErr } = await getAdminClient()
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptErr || !attempt) {
      console.error("GET /api/quiz/[quizId]/review - attempt not found", attemptErr);
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // 3. Fetch selected answers
    const { data: answers, error: ansErr } = await getAdminClient()
      .from("quiz_attempt_answers")
      .select("question_id, selected_option")
      .eq("attempt_id", attemptId);

    if (ansErr) {
      console.error("GET /api/quiz/[quizId]/review - answers fetch error", ansErr);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const answerMap: Record<string, string> = {};
    (answers || []).forEach((a: any) => (answerMap[a.question_id] = a.selected_option));

    // 4. Fetch mappings and question details
    const { data: mappings, error: mapErr } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mapErr) {
      console.error("GET /api/quiz/[quizId]/review - mappings fetch error", mapErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const qIds = (mappings || []).map((m: any) => m.practice_question_id);

    const { data: questionsRaw, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation")
      .in("id", qIds || []);

    if (qErr) {
      console.error("GET /api/quiz/[quizId]/review - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questions = (mappings || []).map((m: any) => questionsRaw.find((q: any) => q.id === m.practice_question_id)).filter(Boolean);

    return NextResponse.json({ quiz, attempt, questions: questions || [], answers: answerMap });
  } catch (err) {
    console.error("GET /api/quiz/[quizId]/review exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
