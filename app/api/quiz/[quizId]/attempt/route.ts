import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const params = await ctx.params;
    const quizId = typeof params?.quizId === "string" ? params.quizId : "";
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");
    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    const admin = getAdminClient();
    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .select("id, title, description")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      console.error("quiz attempt: quiz lookup failed", quizError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    let savedAnswers: Record<string, string | null> = {};
    if (attemptId) {
      const userId = await getAuthenticatedUserId();
      if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

      const { data: attempt, error: attemptError } = await admin
        .from("quiz_attempts")
        .select("id, quiz_id, user_id, status")
        .eq("id", attemptId)
        .maybeSingle();

      if (attemptError) {
        console.error("quiz attempt: attempt lookup failed", attemptError);
        return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
      }
      if (!attempt || attempt.quiz_id !== quizId) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
      if (attempt.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (attempt.status === "submitted") return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });

      const { data: answers, error: answersError } = await admin
        .from("quiz_attempt_answers")
        .select("question_id, selected_option")
        .eq("attempt_id", attemptId);

      if (answersError) {
        console.error("quiz attempt: saved answer lookup failed", answersError);
        return NextResponse.json({ error: "Failed to load saved answers" }, { status: 500 });
      }
      for (const answer of answers || []) savedAnswers[answer.question_id] = answer.selected_option;
    }

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index, practice_questions(question, option_a, option_b, option_c, option_d)")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("quiz attempt: mapping lookup failed", mappingsError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questions = (mappings || []).map((row: any, index: number) => ({
      id: row.practice_question_id,
      question: row.practice_questions?.question || "",
      option_a: row.practice_questions?.option_a || "",
      option_b: row.practice_questions?.option_b || "",
      option_c: row.practice_questions?.option_c || "",
      option_d: row.practice_questions?.option_d || "",
      question_number: row.order_index ?? index + 1,
    }));

    return NextResponse.json({ quiz, questions, savedAnswers });
  } catch (err) {
    console.error("GET quiz attempt exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
