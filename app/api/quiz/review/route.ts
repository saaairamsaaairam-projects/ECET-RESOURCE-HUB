import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const attemptId = url.searchParams.get("attempt");

    if (!attemptId)
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    // 1. Fetch attempt
    const { data: attempt, error: aErr } = await getAdminClient()
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (aErr || !attempt) {
      console.error("GET /api/quiz/review - attempt fetch error", aErr);
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // 2. Fetch answers for the attempt
    const { data: answers, error: ansErr } = await getAdminClient()
      .from("quiz_attempt_answers")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("created_at", { ascending: true });

    if (ansErr) {
      console.error("GET /api/quiz/review - answers fetch error", ansErr);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const questionIds = (answers || []).map((a: any) => a.question_id);

    // 2. Fetch question details
    const { data: questions, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation")
      .in("id", questionIds || []);

    if (qErr) {
      console.error("GET /api/quiz/review - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    return NextResponse.json({ attempt: { ...attempt }, answers: answers || [], questions: questions || [] });
  } catch (err) {
    console.error("GET /api/quiz/review exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
