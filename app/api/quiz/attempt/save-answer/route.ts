import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, question_number, answer, is_marked } = body;

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Find latest attempt for quiz
    const { data: attempts, error: atErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .order("started_at", { ascending: false })
      .limit(1);

    const attempt = attempts?.[0];
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const { error: upErr } = await supabase
      .from("quiz_attempt_answers")
      .update({ answer, is_marked })
      .eq("attempt_id", attempt.id)
      .eq("question_number", question_number);

    if (upErr) {
      console.error("save-answer: update failed", upErr);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/quiz/attempt/save-answer exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, question_number, answer, is_marked, attemptId } = body;

    if (!quizId || typeof question_number === "undefined") {
      return NextResponse.json({ error: "Missing quizId or question_number" }, { status: 400 });
    }

    // find attempt id if not provided
    let aId = attemptId;
    if (!aId) {
      const { data: aRows } = await getAdminClient()
        .from("quiz_attempts")
        .select("id")
        .eq("quiz_id", quizId)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1);
      aId = aRows && aRows[0] && aRows[0].id;
      if (!aId) return NextResponse.json({ error: "No active attempt found" }, { status: 400 });
    }

    // get mapping to practice_question_id
    const { data: mappings } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    const map = mappings || [];
    const idx = Number(question_number) - 1;
    const pqId = map[idx] && map[idx].practice_question_id;
    if (!pqId) return NextResponse.json({ error: "Question mapping not found" }, { status: 400 });

    // upsert answer
    const payload = {
      attempt_id: aId,
      question_id: pqId,
      user_answer: answer,
      is_marked: !!is_marked,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await getAdminClient()
      .from("quiz_attempt_answers")
      .upsert(payload, { onConflict: ["attempt_id", "question_id"] });

    if (error) {
      console.error("POST /api/quiz/attempt/save-answer error", error);
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST /api/quiz/attempt/save-answer exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
