import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

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
      const { data: aRows } = await supabase
        .from("quiz_attempts")
        .select("id")
        .eq("quiz_id", quizId)
        .order("started_at", { ascending: false })
        .limit(1);
      aId = aRows && aRows[0] && aRows[0].id;
      if (!aId) return NextResponse.json({ error: "No active attempt found" }, { status: 400 });
    }

    // upsert answer (using question_number mapping directly)
    const { error: upErr } = await supabase
      .from("quiz_attempt_answers")
      .update({ answer, is_marked })
      .eq("attempt_id", aId)
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
