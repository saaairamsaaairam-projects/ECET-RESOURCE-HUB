import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await req.json();
    const attemptId = typeof body?.attemptId === "string" ? body.attemptId : "";
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status, score, started_at")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("finish: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", attempt.quiz_id)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("finish: mapping lookup failed", mappingsError);
      return NextResponse.json({ error: "Failed to load quiz questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((row: any) => row.practice_question_id);
    const total = questionIds.length;
    if (total === 0) return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });

    // Repeated finish calls return the already persisted result and cannot alter it.
    if (attempt.status === "submitted") {
      const score = Number(attempt.score ?? 0);
      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        timeTaken: attempt.started_at ? Math.max(0, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000)) : 0,
      });
    }

    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer")
      .eq("attempt_id", attempt.id);

    if (answersError) {
      console.error("finish: answer lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const { data: questions, error: questionsError } = await admin
      .from("practice_questions")
      .select("id, correct_option")
      .in("id", questionIds);

    if (questionsError) {
      console.error("finish: correct-option lookup failed", questionsError);
      return NextResponse.json({ error: "Failed to score quiz" }, { status: 500 });
    }

    const correctById = new Map<string, string>(
      (questions || []).map((question: any) => [question.id, String(question.correct_option || "").trim().toUpperCase()])
    );
    if (correctById.size !== total) {
      console.error("finish: some mapped questions are missing correct_option values");
      return NextResponse.json({ error: "Quiz question data is incomplete" }, { status: 500 });
    }

    const allowedIds = new Set(questionIds);
    const answerById = new Map<string, any>();
    for (const answer of answers || []) {
      if (allowedIds.has(answer.question_id)) answerById.set(answer.question_id, answer);
    }

    let score = 0;
    for (const questionId of questionIds) {
      const answer = answerById.get(questionId);
      const selected = String(answer?.selected_option ?? answer?.user_answer ?? "").trim().toUpperCase();
      if (selected && selected === correctById.get(questionId)) score += 1;
    }

    const timeTaken = attempt.started_at
      ? Math.max(0, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000))
      : 0;

    const { data: updated, error: updateError } = await admin
      .from("quiz_attempts")
      .update({ score, status: "submitted" })
      .eq("id", attempt.id)
      .eq("user_id", userId)
      .or("status.is.null,status.neq.submitted")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("finish: failed to persist result", updateError);
      return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
    }

    if (!updated) {
      // Another concurrent request may have submitted it; read the persisted score.
      const { data: finalAttempt, error: finalError } = await admin
        .from("quiz_attempts")
        .select("id, score, status")
        .eq("id", attempt.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (finalError || !finalAttempt || finalAttempt.status !== "submitted") {
        return NextResponse.json({ error: "Failed to confirm quiz submission" }, { status: 500 });
      }
      score = Number(finalAttempt.score ?? score);
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timeTaken,
    });
  } catch (err) {
    console.error("POST /api/quiz/attempt/finish exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
