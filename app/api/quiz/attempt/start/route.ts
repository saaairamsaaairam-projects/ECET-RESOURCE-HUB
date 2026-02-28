import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const { quizId, userId } = await req.json();

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    const admin = getAdminClient();

    // Ensure both `quizzes` and `quiz_sets` have a row for this quiz id to satisfy any FK configuration.
    // Attempt to upsert into both tables using data from whichever exists.
    const { data: quizRow } = await admin.from('quizzes').select('*').eq('id', quizId).single();
    const { data: quizSetRow } = await admin.from('quiz_sets').select('*').eq('id', quizId).single();

    // Build payloads from whichever source is present
    const source = quizRow || quizSetRow;
    if (!source) {
      return NextResponse.json({ error: 'Quiz not found in quizzes or quiz_sets' }, { status: 404 });
    }

    const quizzesPayload: any = {
      id: source.id,
      title: source.title || source.name,
      description: source.description || null,
      subject_folder_id: source.subject_folder_id,
      mode: source.mode || 'practice',
      total_questions: source.total_questions || 0,
      duration_minutes: source.duration || source.duration_minutes || null,
      created_at: source.created_at || undefined,
      updated_at: source.updated_at || undefined,
    };

    const quizSetsPayload: any = {
      id: source.id,
      name: source.name || source.title,
      description: source.description || null,
      subject_folder_id: source.subject_folder_id,
      mode: source.mode || 'practice',
      total_questions: source.total_questions || 0,
      duration: source.duration || source.duration_minutes || null,
      created_at: source.created_at || undefined,
      updated_at: source.updated_at || undefined,
    };

    // Upsert into `quizzes`
    const { error: upsertQuizErr } = await admin.from('quizzes').upsert(quizzesPayload, { onConflict: 'id' });
    if (upsertQuizErr) console.error('start: upsert quizzes error', upsertQuizErr);

    // Upsert into `quiz_sets` (legacy)
    const { error: upsertSetErr } = await admin.from('quiz_sets').upsert(quizSetsPayload, { onConflict: 'id' });
    if (upsertSetErr) console.error('start: upsert quiz_sets error', upsertSetErr);

    // Step 1 — Create attempt (allow userId to be null for guest attempts)
    const { data: attempt, error: aErr } = await admin
      .from('quiz_attempts')
      .insert([{ quiz_id: quizId, user_id: userId || null }])
      .select()
      .single();

    if (aErr || !attempt) {
      // Provide debugging info (safe in dev)
      const qExists = await admin.from('quizzes').select('id').eq('id', quizId).single();
      const sExists = await admin.from('quiz_sets').select('id').eq('id', quizId).single();
      console.error('start: attempt insert failed', aErr);
      return NextResponse.json(
        {
          error: aErr?.message || 'Failed to create attempt',
          debug: {
            quizzesRow: qExists.data || null,
            quizSetsRow: sExists.data || null,
            upsertQuizErr: upsertQuizErr || null,
            upsertSetErr: upsertSetErr || null,
          },
        },
        { status: 500 }
      );
    }

    // Step 2 — Get quiz questions
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("id, question_number")
      .eq("quiz_id", quizId)
      .order("question_number", { ascending: true });

    if (qErr) {
      console.error("start: failed to load questions", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // Step 3 — Create answer rows
    const answerRows = (questions || []).map((q: any) => ({
      attempt_id: attempt.id,
      question_id: q.id,
      question_number: q.question_number,
      answer: null,
      is_marked: false,
    }));

    if (answerRows.length) {
      const { error: insErr } = await supabase.from("quiz_attempt_answers").insert(answerRows);
      if (insErr) console.error("start: failed to insert answer rows", insErr);
    }

    return NextResponse.json({ attemptId: attempt.id });
  } catch (err) {
    console.error("POST /api/quiz/attempt/start exception:", err);
    const isDev = process.env.NODE_ENV !== "production";
    const payload: any = { error: "Server error" };
    if (isDev) {
      payload.details = (err as any)?.message || String(err);
      payload.stack = (err as any)?.stack || null;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
