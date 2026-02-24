import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const { quizId, userId } = await req.json();

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Step 1 — Create attempt (allow userId to be null for guest attempts)
    const { data: attempt, error: aErr } = await supabase
      .from("quiz_attempts")
      .insert([{ quiz_id: quizId, user_id: userId || null }])
      .select()
      .single();

    if (aErr || !attempt) return NextResponse.json({ error: aErr?.message || "Failed to create attempt" }, { status: 400 });

    // Step 2 — Get quiz questions
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("id, question_number")
      .eq("quiz_id", quizId)
      .order("question_number", { ascending: true });

    if (qErr) {
      console.error("start: failed to load questions", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // Step 3 — Create answer rows
    const answerRows = (questions || []).map((q: any) => ({
      attempt_id: attempt.id,
      question_id: q.id,
      question_number: q.question_number,
      answer: null,
      is_marked: false,
    }));

    if (answerRows.length) {
      const { error: insErr } = await supabase.from("quiz_attempt_answers").insert(answerRows);
      if (insErr) console.error("start: failed to insert answer rows", insErr);
    }

    return NextResponse.json({ attemptId: attempt.id });
  } catch (err) {
    console.error("POST /api/quiz/attempt/start exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
