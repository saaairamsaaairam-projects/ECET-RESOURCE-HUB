import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, questionId, selectedOption } = body;

    if (!attemptId || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields: attemptId, questionId" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // Ensure attempt exists before saving answer
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      console.error("save-answer: attempt not found", { attemptId, attemptError });
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    // Upsert answer with selected_option
    const { error } = await admin
      .from("quiz_attempt_answers")
      .upsert(
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: selectedOption,
        },
        {
          onConflict: "attempt_id,question_id",
        }
      );

    if (error) {
      console.error("save-answer: upsert error", error);
      return NextResponse.json(
        { error: error.message || "Failed to save answer" },
        { status: 500 }
      );
    }

    console.debug("save-answer: success", { attemptId, questionId, selectedOption });
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("POST /api/quiz/attempt/save-answer exception:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
