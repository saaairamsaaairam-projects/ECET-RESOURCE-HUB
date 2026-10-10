import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = await req.json();
    const quizId = typeof body?.quizId === "string" ? body.quizId : "";
    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    const admin = getAdminClient();
    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .select("id")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      console.error("start: quiz lookup failed", quizError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const { data: mappings, error: mappingsError } = await admin
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mappingsError) {
      console.error("start: failed to load quiz questions", mappingsError);
      return NextResponse.json({ error: "Failed to load quiz questions" }, { status: 500 });
    }
    if (!mappings?.length) return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });

    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .insert({ quiz_id: quizId, user_id: userId })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      console.error("start: attempt insert failed", attemptError);
      return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
    }

    const answerRows = mappings.map((mapping: any, index: number) => ({
      attempt_id: attempt.id,
      // question_id is the practice_questions.id, not quiz_questions.id.
      question_id: mapping.practice_question_id,
      question_number: mapping.order_index ?? index + 1,
      selected_option: null,
      user_answer: null,
      is_marked: false,
    }));

    const { error: answersError } = await admin
      .from("quiz_attempt_answers")
      .insert(answerRows);

    if (answersError) {
      console.error("start: failed to initialize answer rows", answersError);
      await admin.from("quiz_attempts").delete().eq("id", attempt.id).eq("user_id", userId);
      return NextResponse.json({ error: "Failed to initialize quiz attempt" }, { status: 500 });
    }

    return NextResponse.json({ attemptId: attempt.id });
  } catch (err) {
    console.error("POST /api/quiz/attempt/start exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
