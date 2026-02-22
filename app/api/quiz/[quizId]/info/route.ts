import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const { quizId } = params;

    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const { data: qids } = await supabase
      .from("quiz_questions")
      .select("question_id")
      .eq("quiz_id", quizId);

    return NextResponse.json({ quiz, totalQuestions: (qids || []).length });
  } catch (err) {
    console.error("GET /api/quiz/[quizId]/info exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
