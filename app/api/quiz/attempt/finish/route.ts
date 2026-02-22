import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const { quizId, userId } = await req.json();

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Get attempt
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .single();

    if (attErr || !attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Get answers
    const { data: answers, error: ansErr } = await supabase
      .from("quiz_attempt_answers")
      .select("question_number, answer")
      .eq("attempt_id", attempt.id);

    if (ansErr) console.error("finish: failed to load answers", ansErr);

    // Get correct answers
    const { data: correct, error: cErr } = await supabase
      .from("quiz_questions")
      .select("question_number, correct_answer")
      .eq("quiz_id", quizId);

    if (cErr) console.error("finish: failed to load correct answers", cErr);

    // Compare
    let score = 0;
    (answers || []).forEach((a: any) => {
      const c = (correct || []).find((x: any) => x.question_number === a.question_number);
      if (c && c.correct_answer === a.answer) score++;
    });

    // Update attempt
    const { error: upErr } = await supabase
      .from("quiz_attempts")
      .update({ finished_at: new Date().toISOString(), score })
      .eq("id", attempt.id);

    if (upErr) console.error("finish: failed to update attempt", upErr);

    return NextResponse.json({ success: true, score });
  } catch (err) {
    console.error("POST /api/quiz/attempt/finish exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId } = body;

    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    // load answers
    const { data: answers, error: aErr } = await getAdminClient()
      .from("quiz_attempt_answers")
      .select("*")
      .eq("attempt_id", attemptId);

    if (aErr) {
      console.error("POST /api/quiz/attempt/finish - answers fetch error", aErr);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    // compute score: compare to practice_questions
    const qIds = (answers || []).map((a: any) => a.question_id);
    const { data: questions, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, correct_answer")
      .in("id", qIds || []);

    if (qErr) {
      console.error("POST /api/quiz/attempt/finish - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const correctMap: Record<string, string> = {};
    (questions || []).forEach((q: any) => (correctMap[q.id] = String(q.correct_answer)));

    let correct = 0;
    (answers || []).forEach((a: any) => {
      if (String(a.user_answer) === String(correctMap[a.question_id])) correct += 1;
    });

    const total = (answers || []).length;

    const { error: updErr } = await getAdminClient()
      .from("quiz_attempts")
      .update({ score: correct, total_questions: total, correct_answers: correct, wrong_answers: total - correct, status: "submitted", completed_at: new Date().toISOString() })
      .eq("id", attemptId);

    if (updErr) {
      console.error("POST /api/quiz/attempt/finish - update error", updErr);
      return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
    }

    return NextResponse.json({ success: true, score: correct, total });
  } catch (err) {
    console.error("POST /api/quiz/attempt/finish exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
