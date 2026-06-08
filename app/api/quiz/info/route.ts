import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quizId");
    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("id, title, duration_minutes, total_questions, subject_folder_id")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      console.error("GET /api/quiz/info - quiz not found", error);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // normalize field names for client code
    return NextResponse.json({
      ...quiz,
      title: quiz.title || (quiz as any).name,
      duration: quiz.duration_minutes,
    });
  } catch (err) {
    console.error("GET /api/quiz/info exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
