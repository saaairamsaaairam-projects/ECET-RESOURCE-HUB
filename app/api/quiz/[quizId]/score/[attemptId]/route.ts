import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { params } = ctx;
    const { quizId, attemptId } = params || {};

    // Fetch quiz
    const { data: quiz, error: quizErr } = await getAdminClient()
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      console.error("GET /api/quiz/[quizId]/score - quiz not found", quizErr);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Fetch attempt
    const { data: attempt, error: attemptErr } = await getAdminClient()
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptErr || !attempt) {
      console.error("GET /api/quiz/[quizId]/score - attempt not found", attemptErr);
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Fetch user answers
    const { data: answers, error: ansErr } = await getAdminClient()
      .from("quiz_attempt_answers")
      .select("question_id, selected_option")
      .eq("attempt_id", attemptId);

    if (ansErr) {
      console.error("GET /api/quiz/[quizId]/score - answers fetch error", ansErr);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const answerMap: Record<string, string> = {};
    (answers || []).forEach((a: any) => (answerMap[a.question_id] = a.selected_option));

    // Fetch quiz -> practice question mappings, then actual questions for correctness
    const { data: mappings, error: mapErr } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id")
      .eq("quiz_id", quizId);

    if (mapErr) {
      console.error("GET /api/quiz/[quizId]/score - mappings fetch error", mapErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((m: any) => m.practice_question_id);

    const { data: qlist, error: qlistErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, correct_answer")
      .in("id", questionIds || []);

    if (qlistErr) {
      console.error("GET /api/quiz/[quizId]/score - questions fetch error", qlistErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const total = (qlist || []).length;

    (qlist || []).forEach((q: any) => {
      const ans = answerMap[q.id];
      if (!ans) unanswered++;
      else if (String(ans).toUpperCase() === String(q.correct_answer).toUpperCase()) correct++;
      else wrong++;
    });

    return NextResponse.json({ quiz, attempt, correct, wrong, unanswered, total });
  } catch (err) {
    console.error("GET /api/quiz/[quizId]/score exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
