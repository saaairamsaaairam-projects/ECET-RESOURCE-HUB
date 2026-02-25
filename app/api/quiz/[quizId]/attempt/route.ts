import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { params } = ctx;
    const { quizId } = params || {};
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");

    const client = getAdminClient();

    // Fetch quiz metadata
    const { data: quiz, error: quizErr } = await client
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      console.error("GET /api/quiz/[quizId]/attempt - quiz not found", quizErr);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Fetch quiz question mappings
    const { data: mappings, error: mapErr } = await client
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mapErr) {
      console.error("GET /api/quiz/[quizId]/attempt - mappings error", mapErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((m: any) => m.practice_question_id);

    // Fetch actual practice questions
    const { data: questionsRaw, error: qErr } = await client
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation")
      .in("id", questionIds || []);

    if (qErr) {
      console.error("GET /api/quiz/[quizId]/attempt - questions error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // Order questions according to mappings
    const questions = (mappings || []).map((m: any) => questionsRaw.find((q: any) => q.id === m.practice_question_id)).filter(Boolean);

    // Fetch saved answers if attemptId provided
    let savedAnswers: Record<string, string> = {};
    if (attemptId) {
      const { data: answers, error: ansErr } = await client
        .from("quiz_attempt_answers")
        .select("question_id, selected_option")
        .eq("attempt_id", attemptId);

      if (!ansErr && answers) {
        (answers || []).forEach((a: any) => (savedAnswers[a.question_id] = a.selected_option));
      }
    }

    return NextResponse.json({ quiz, questions: questions || [], savedAnswers });
  } catch (err) {
    console.error("GET /api/quiz/[quizId]/attempt exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
