import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

const OPTIONS = new Set(["A", "B", "C", "D"]);

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await req.json();
    const attemptId = typeof body?.attemptId === "string" ? body.attemptId : "";
    const questionId = typeof body?.questionId === "string" ? body.questionId : "";
    const selectedOption = body?.selectedOption == null ? null : String(body.selectedOption).toUpperCase();

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: "Missing required fields: attemptId, questionId" }, { status: 400 });
    }
    if (selectedOption !== null && !OPTIONS.has(selectedOption)) {
      return NextResponse.json({ error: "selectedOption must be A, B, C, D, or null" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("save-answer: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status === "submitted") return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });

    const { data: mapping, error: mappingError } = await admin
      .from("quiz_questions")
      .select("practice_question_id")
      .eq("quiz_id", attempt.quiz_id)
      .eq("practice_question_id", questionId)
      .maybeSingle();

    if (mappingError) {
      console.error("save-answer: question mapping lookup failed", mappingError);
      return NextResponse.json({ error: "Failed to validate question" }, { status: 500 });
    }
    if (!mapping) return NextResponse.json({ error: "Question is not part of this quiz" }, { status: 400 });

    const { data: existing, error: existingError } = await admin
      .from("quiz_attempt_answers")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existingError) {
      console.error("save-answer: existing answer lookup failed", existingError);
      return NextResponse.json({ error: "Failed to validate answer" }, { status: 500 });
    }

    const write = existing
      ? admin.from("quiz_attempt_answers").update({ selected_option: selectedOption, user_answer: selectedOption }).eq("attempt_id", attemptId).eq("question_id", questionId)
      : admin.from("quiz_attempt_answers").insert({ attempt_id: attemptId, question_id: questionId, selected_option: selectedOption, user_answer: selectedOption });

    const { error } = await write;
    if (error) {
      console.error("save-answer: write failed", error);
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/quiz/attempt/save-answer exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
