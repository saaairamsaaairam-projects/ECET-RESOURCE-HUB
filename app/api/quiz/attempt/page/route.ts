import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const url = new URL(req.url);
    const quizId = url.searchParams.get("quizId");
    const page = Number(url.searchParams.get("page") || "1");
    const attemptId = url.searchParams.get("attempt") || url.searchParams.get("attemptId");

    if (!quizId || !attemptId) return NextResponse.json({ error: "Missing quizId or attemptId" }, { status: 400 });
    if (!Number.isInteger(page) || page < 1) return NextResponse.json({ error: "Invalid page" }, { status: 400 });

    const admin = getAdminClient();
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError) {
      console.error("attempt/page: attempt lookup failed", attemptError);
      return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
    }
    if (!attempt || attempt.quiz_id !== quizId) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.status === "submitted") return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });

    const { data: mappings, error: mappingError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index, practice_questions(question, option_a, option_b, option_c, option_d)")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mappingError) {
      console.error("attempt/page: mapping lookup failed", mappingError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }

    const ordered = (mappings || []).map((row: any, index: number) => ({
      id: row.practice_question_id,
      question: row.practice_questions?.question || "",
      option_a: row.practice_questions?.option_a || "",
      option_b: row.practice_questions?.option_b || "",
      option_c: row.practice_questions?.option_c || "",
      option_d: row.practice_questions?.option_d || "",
      question_number: index + 1,
      order_index: row.order_index,
    }));

    const start = (page - 1) * 5;
    const pageQuestions = ordered.slice(start, start + 5);

    const { data: answers, error: answersError } = await admin
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer, question_number, is_marked")
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("attempt/page: answers lookup failed", answersError);
      return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
    }

    const answersMap: Record<number, any> = {};
    (answers || []).forEach((answer: any) => {
      const index = ordered.findIndex((question: any) => question.id === answer.question_id);
      if (index >= 0) answersMap[index + 1] = {
        ...answer,
        user_answer: answer.user_answer ?? answer.selected_option,
      };
    });

    return NextResponse.json({ questions: pageQuestions, answers: answersMap, totalQuestions: ordered.length });
  } catch (err) {
    console.error("GET /api/quiz/attempt/page exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
