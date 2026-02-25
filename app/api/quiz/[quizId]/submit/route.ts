import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: NextRequest, ctx: any) {
  try {
    const { params } = ctx;
    const { quizId } = params || {};
    const body = await req.json();
    const { answers = {}, userId = null } = body;

    // 1. Fetch quiz
    const { data: quiz, error: quizErr } = await getAdminClient()
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      console.error("POST /api/quiz/[quizId]/submit - quiz not found", quizErr);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // 2. Fetch mapping to practice questions for correct answers
    const { data: mappings, error: mapErr } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id")
      .eq("quiz_id", quizId);

    if (mapErr) {
      console.error("POST /api/quiz/[quizId]/submit - mappings fetch error", mapErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const questionIds = (mappings || []).map((m: any) => m.practice_question_id);

    const { data: allQuestions, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, correct_answer")
      .in("id", questionIds || []);

    if (qErr) {
      console.error("POST /api/quiz/[quizId]/submit - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // 3. Calculate score
    let score = 0;
    const total = (allQuestions || []).length;

    (allQuestions || []).forEach((q: any) => {
      const given = answers[q.id];
      if (!given) return;
      const normalizedGiven = String(given).toUpperCase();
      if (normalizedGiven === String(q.correct_answer).toUpperCase()) {
        score++;
      }
    });

    // 4. Save attempt
    let attemptRecord: any = null;
    try {
      const { data: attempt, error: aErr } = await getAdminClient()
        .from("quiz_attempts")
        .insert([
          {
            quiz_id: quizId,
            user_id: userId,
            score,
            total_questions: total,
            correct_answers: score,
            wrong_answers: total - score,
            status: "submitted",
          },
        ])
        .select()
        .single();

      if (aErr) {
        console.warn("Could not insert attempt, continuing without persistence", aErr);
      } else {
        attemptRecord = attempt;

        const list = Object.entries(answers).map(([question_id, selected]) => ({
          attempt_id: attempt.id,
          question_id,
          selected_option: selected,
        }));

        if (list.length) {
          const { error: ansErr } = await getAdminClient().from("quiz_attempt_answers").insert(list);
          if (ansErr) console.warn("Could not insert attempt answers", ansErr);
        }
      }
    } catch (err) {
      console.warn("Persisting attempt failed", err);
    }

    return NextResponse.json({
      success: true,
      attemptId: attemptRecord?.id || null,
      score: quiz.show_score ? score : null,
      show_review: !!quiz.show_review,
    });
  } catch (err) {
    console.error("POST /api/quiz/[quizId]/submit exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
