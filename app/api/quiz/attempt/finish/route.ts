import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, quizId: bodyQuizId, userId } = body;

    let attempt: any = null;
    if (attemptId) {
      const { data: a, error: attemptErr } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();
      if (attemptErr || !a) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
      attempt = a;
    } else {
      const quizId = bodyQuizId;
      if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
      const { data: a, error: attErr } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();
      if (attErr || !a) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
      attempt = a;
    }

    // Load saved answers for this attempt
    const { data: answers, error: ansErr } = await supabase
      .from("quiz_attempt_answers")
      .select("question_id, selected_option, user_answer")
      .eq("attempt_id", attempt.id);

    if (ansErr) console.error("finish: failed to load answers", ansErr);

    // Load quiz -> practice_question mappings
    const { data: mappings, error: mapErr } = await supabase
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", attempt.quiz_id)
      .order("order_index", { ascending: true });

    if (mapErr) {
      console.error("finish: failed to load mappings", mapErr);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }

    const qIds = (mappings || []).map((m: any) => m.practice_question_id);

    // Fetch practice question correct answers
    const { data: questionsRaw, error: qErr } = await supabase
      .from("practice_questions")
      .select("id, correct_answer")
      .in("id", qIds || []);

    if (qErr) console.error("finish: failed to load practice questions", qErr);

    const correctMap: Record<string, string> = {};
    (questionsRaw || []).forEach((q: any) => (correctMap[q.id] = String(q.correct_answer)));

    // Compute score
    let correct = 0;
    (answers || []).forEach((a: any) => {
      const selected = a.selected_option ?? a.user_answer ?? null;
      if (selected != null && String(selected) === String(correctMap[a.question_id])) correct += 1;
    });

    const total = (answers || []).length;

    // Update attempt record with final scores
    const timeTakenSeconds = Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
    
    const { error: updErr } = await supabase
      .from("quiz_attempts")
      .update({ 
        score: correct,
        status: "submitted"
      })
      .eq("id", attempt.id);

    if (updErr) console.error("finish: failed to update attempt", updErr);

    // Return final result with calculated metrics
    const percentage = Math.round((correct / total) * 100);
    return NextResponse.json({ 
      success: true, 
      attemptId: attempt.id,
      score: correct,
      total,
      percentage,
      timeTaken: timeTakenSeconds
    });
  } catch (err) {
    console.error("POST /api/quiz/attempt/finish exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
