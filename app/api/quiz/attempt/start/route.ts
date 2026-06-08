import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { getAdminClient } from "@/utils/serverAuth";

interface AttemptStartPayload {
  quizId: string;
  userId?: string | null;
}

export async function POST(req: Request) {
  try {
    const { quizId, userId }: AttemptStartPayload = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const admin = getAdminClient();

    // verify quiz exists, or create a placeholder if missing (last resort)
    let { data: quizRow, error: quizErr } = await admin
      .from("quizzes")
      .select("id, title, subject_folder_id")
      .eq("id", quizId)
      .single();

    console.debug("start: quiz lookup result", { quizRow, quizErr });

    if (quizErr || !quizRow) {
      console.warn("start: quiz row missing, attempting placeholder insertion", {
        quizId,
        quizErr,
      });

      // obtain any existing folder to satisfy NOT NULL & FK
      const { data: folderData, error: folderErr } = await admin
        .from("folders")
        .select("id")
        .limit(1)
        .single();

      if (folderErr || !folderData) {
        console.error("start: cannot create placeholder quiz, no folder available", folderErr);
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      const placeholder = {
        id: quizId,
        title: "Untitled quiz",
        total_questions: 0,
        subject_folder_id: folderData.id,
      };

      const { data: newQuiz, error: insertErr } = await admin
        .from("quizzes")
        .upsert(placeholder, { onConflict: "id" })
        .select()
        .single();
      if (insertErr) {
        console.error("start: failed to create placeholder quiz row", insertErr);
        return NextResponse.json(
          { error: "Quiz not found" },
          { status: 404 }
        );
      }
      quizRow = newQuiz;
    }

    // verify there are questions attached to the quiz
    const { data: qExists, error: qErr } = await admin
      .from("quiz_questions")
      .select("id")
      .eq("quiz_id", quizId)
      .limit(1);

    if (qErr) {
      console.error("start: failed to load quiz questions", qErr);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    if (!qExists || qExists.length === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
    }

    // before inserting attempt, ensure the quiz row exists. there are two possibilities:
    // 1. migrated database already has the quiz; the upsert will be a no-op.
    // 2. migration hasn't run yet and the row was removed/never created; we try to
    //    copy from legacy `quiz_sets` data so the FK insert will succeed.
    let ensureErr = null;

    // first attempt a simple upsert inserting some minimal fields (fast-path)
    {
      // build stub object using whatever we already know from quizRow
      const stub: any = { id: quizId };
      if (quizRow?.title) stub.title = quizRow.title;
      if (quizRow?.subject_folder_id) stub.subject_folder_id = quizRow.subject_folder_id;
      if (!stub.subject_folder_id) {
        const { data: f } = await admin
          .from("folders")
          .select("id")
          .limit(1)
          .single();
        if (f) stub.subject_folder_id = f.id;
      }
      // use upsert to avoid duplicate key errors entirely
      const { error } = await admin
        .from("quizzes")
        .upsert(stub, { onConflict: "id" });
      ensureErr = error;
    }

    if (ensureErr) {
      const msg = ensureErr.message || "";
      // if failure is due to NOT NULL columns, try to fetch a full row from quiz_sets
      if (/null value in column "title"/i.test(msg)) {
        console.warn("start: quiz row missing, attempting lazy copy from quiz_sets", { quizId });
        const { data: legacy, error: legacyErr } = await admin
          .from("quiz_sets")
          .select("subject_folder_id, name, description, mode, total_questions")
          .eq("id", quizId)
          .single();

        if (legacyErr || !legacy) {
          console.error("start: could not load legacy quiz_sets row", {
            quizId,
            legacyErr,
          });
          return NextResponse.json(
            {
              error: "Quiz row missing and legacy copy failed",
              details: "Run the migration to populate quizzes table",
            },
            { status: 500 }
          );
        }

        const { error: secondErr } = await admin
          .from("quizzes")
          .upsert(
            {
              id: quizId,
              subject_folder_id: legacy.subject_folder_id,
              title: legacy.name,
              description: legacy.description,
              mode: legacy.mode,
              total_questions: legacy.total_questions,
            },
            { onConflict: "id" }
          );
        if (secondErr) {
          console.error("start: failed to insert migrated quiz row", {
            quizId,
            error: secondErr,
          });
          return NextResponse.json(
            {
              error: "Failed to ensure quiz row exists",
              details: secondErr.message || secondErr,
            },
            { status: 500 }
          );
        }

        // cleared now, continue with attempt insertion
      } else {
        console.error("start: error ensuring quiz row exists", { quizId, error: ensureErr });
        return NextResponse.json(
          { error: "Failed to ensure quiz row exists", details: ensureErr.message || ensureErr },
          { status: 500 }
        );
      }
    }

    // create the attempt
    const { data: attempt, error: aErr } = await admin
      .from("quiz_attempts")
      .insert([{ quiz_id: quizId, user_id: userId || null }])
      .select()
      .single();

    if (aErr || !attempt) {
      console.error("start: attempt insert failed", aErr);
      const payload: any = { error: "Failed to create attempt" };
      if (aErr) payload.details = aErr.message || aErr;
      return NextResponse.json(payload, { status: 500 });
    }

    // pre‑populate answer rows using public client
    const { data: questions, error: questionsErr } = await supabase
      .from("quiz_questions")
      // order_index is the column on quiz_questions; use it for numbering
      .select("id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (questionsErr) console.error("start: failed to load questions", questionsErr);

    const answerRows = (questions || []).map((q: any, idx: number) => ({
      attempt_id: attempt.id,
      question_id: q.id,
      // convert order_index to a 1-based question number for storage
      question_number: q.order_index != null ? q.order_index : idx + 1,
      // store both selected_option and user_answer columns for compatibility
      selected_option: null,
      user_answer: null,
      is_marked: false,
    }));

    if (answerRows.length) {
      const { error: insErr } = await supabase
        .from("quiz_attempt_answers")
        .insert(answerRows);
      if (insErr) console.error("start: failed to insert answer rows", insErr);
    }

    return NextResponse.json({ attemptId: attempt.id });
  } catch (err) {
    console.error("POST /api/quiz/attempt/start exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

