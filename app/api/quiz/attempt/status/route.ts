import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const admin = getAdminClient();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const attemptId = searchParams.get("attempt") || searchParams.get("attemptId");

    console.debug("GET /api/quiz/attempt/status", { quizId, attemptId });

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    // Get attempt row; prefer attemptId when supplied, otherwise fall back to quiz/user lookup
    let attempt: any = null;
    if (attemptId) {
      const { data, error } = await admin
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();
      attempt = data;
      if (error) console.error("status: lookup by attemptId failed", error);
    }

    if (!attempt) {
      const userId = searchParams.get("userId");
      const { data, error } = await admin
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", userId)
        .single();
      attempt = data;
      if (error) console.error("status: lookup by quiz/user failed", error);
    }

    if (!attempt) {
      console.warn("status: no attempt row returned", { quizId, attemptId });
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get all answers (question_number may not exist in older schemas)
    let answers: any[] = [];
    {
      const { data: ansRows, error: ansErr } = await admin
        .from("quiz_attempt_answers")
        .select("*")
        .eq("attempt_id", attempt.id)
        .order("question_number");
      if (ansErr) {
        // fallback when column missing (older migration)
        if (/question_number/i.test(ansErr.message || "")) {
          console.warn("status: question_number missing, retrying without order", ansErr);
          const { data: ansRows2, error: ansErr2 } = await admin
            .from("quiz_attempt_answers")
            .select("*")
            .eq("attempt_id", attempt.id);
          if (ansErr2) console.error("status: failed to load answers after fallback", ansErr2);
          answers = ansRows2 || [];
        } else {
          console.error("status: failed to load answers", ansErr);
        }
      } else {
        answers = ansRows || [];
      }
    }

    // normalize column names for frontend
    answers = answers.map((a: any) => ({
      ...a,
      user_answer: a.user_answer ?? a.selected_option,
    }));

    // Fetch questions along with practice question details so the client can render them
    const { data: questions, error: qErr } = await admin
      .from("quiz_questions")
      .select(`
        id,
        order_index,
        practice_questions(
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          explanation
        )
      `)
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (qErr) console.error("status: failed to load questions", qErr);

    // flatten joined rows for frontend
    const flatQuestions = (questions || []).map((row: any, idx: number) => ({
      id: row.id,
      question: row.practice_questions?.question || "",
      option_a: row.practice_questions?.option_a || "",
      option_b: row.practice_questions?.option_b || "",
      option_c: row.practice_questions?.option_c || "",
      option_d: row.practice_questions?.option_d || "",
      correct_answer: row.practice_questions?.correct_option || "",
      explanation: row.practice_questions?.explanation || "",
      question_number: row.order_index != null ? row.order_index : idx + 1,
    }));

    return NextResponse.json({ questions: flatQuestions, answers: answers || [] });
  } catch (err) {
    console.error("GET /api/quiz/attempt/status exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
