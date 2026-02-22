import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: NextRequest, { params }: { params: { quizId: string; attemptId: string } }) {
  try {
    const { attemptId } = params;
    const body = await req.json();
    const { questionId, option } = body;

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = getAdminClient();

    // Upsert answer: try update, else insert
    const { data, error } = await client
      .from("quiz_attempt_answers")
      .upsert(
        { attempt_id: attemptId, question_id: questionId, selected_option: option },
        { onConflict: ["attempt_id", "question_id"] }
      );

    if (error) {
      console.error("POST save answer error", error);
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /answer exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
