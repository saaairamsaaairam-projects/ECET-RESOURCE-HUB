import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const userId = searchParams.get("userId");

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Get attempt
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .single();

    if (attErr || !attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Get all answers
    const { data: answers, error: ansErr } = await supabase
      .from("quiz_attempt_answers")
      .select("*")
      .eq("attempt_id", attempt.id)
      .order("question_number");

    if (ansErr) console.error("status: failed to load answers", ansErr);

    // Get questions for numbering
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("question_number");

    if (qErr) console.error("status: failed to load questions", qErr);

    return NextResponse.json({ questions: questions || [], answers: answers || [] });
  } catch (err) {
    console.error("GET /api/quiz/attempt/status exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
