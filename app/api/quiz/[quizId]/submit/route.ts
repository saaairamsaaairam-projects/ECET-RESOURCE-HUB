import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUserId } from "@/utils/serverAuth";

export async function POST(_req: NextRequest, ctx: any) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const params = await ctx.params;
    const quizId = typeof params?.quizId === "string" ? params.quizId : "";
    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    const body = await _req.json();
    const answers = body?.answers && typeof body.answers === "object" && !Array.isArray(body.answers) ? body.answers : {};

    const admin = getAdminClient();
    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .select("id, show_score, show_review")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      console.error("submit: quiz lookup failed", quizError);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const { data: mappings, error: mappingError } = await admin
      .from("quiz_questions")
      .select("id, practice_question_id")
      .eq("quiz_id", quizId);

    if (mappingError) {
      console.error("submit: mapping lookup failed", mappingError);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }
    if (!mappings?.length) return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });

    // Older /play UI sends quiz_questions mapping IDs; accept practice question IDs too.
    const answerByPracticeId = new Map<string, string>();
    const mappingIds = new Map<string, string>();
    for (const row of mappings as any[]) {
      mappingIds.set(row.id, row.practice_question_id);
      mappingIds.set(row.practice_question_id, row.practice_question_id);
    }

    for (const [suppliedId, value] of Object.entries(answers)) {
      const practiceId = mappingIds.get(suppliedId);
      if (!practiceId) return NextResponse.json({ error: "Answer includes a question outside this quiz" }, { status: 400 });
      if (value == null || value === "") continue;
      const option = String(value).trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(option)) {
        return NextResponse.json({ error: "Answers must be A, B, C, or D" }, { status: 400 });
      }
      answerByPracticeId.set(practiceId, option);
    }

    const practiceIds = mappings.map((row: any) => row.practice_question_id);
    const { data: questions, error: questionsError } = await admin
      .from("practice_questions")
      .select("id, correct_option")
      .in("id", practiceIds);

    if (questionsError) {
      console.error("submit: question lookup failed", questionsError);
      return NextResponse.json({ error: "Failed to score quiz" }, { status: 500 });
    }

    const correctById = new Map<string, string>((questions || []).map((question: any): [string, string] => [
      question.id,
      String(question.correct_option || "").trim().toUpperCase(),
    ]));
    if (correctById.size !== practiceIds.length) {
      return NextResponse.json({ error: "Quiz question data is incomplete" }, { status: 500 });
    }

    let score = 0;
    for (const id of practiceIds) {
      if (answerByPracticeId.get(id) && answerByPracticeId.get(id) === correctById.get(id)) score++;
    }

    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: userId,
        score,
        total_questions: practiceIds.length,
        correct_answers: score,
        wrong_answers: practiceIds.length - score,
        status: "submitted",
      })
      .select("id, quiz_id, user_id, score, status, started_at")
      .single();

    if (attemptError || !attempt) {
      console.error("submit: attempt insert failed", attemptError);
      return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 });
    }

    const answerRows = practiceIds.map((id: string, index: number) => ({
      attempt_id: attempt.id,
      question_id: id,
      question_number: index + 1,
      selected_option: answerByPracticeId.get(id) ?? null,
      user_answer: answerByPracticeId.get(id) ?? null,
      is_marked: false,
    }));

    const { error: answersError } = await admin.from("quiz_attempt_answers").insert(answerRows);
    if (answersError) {
      console.error("submit: answer persistence failed", answersError);
      await admin.from("quiz_attempts").delete().eq("id", attempt.id).eq("user_id", userId);
      return NextResponse.json({ error: "Failed to save quiz answers" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: quiz.show_score ? score : null,
      show_review: !!quiz.show_review,
    });
  } catch (err) {
    console.error("POST quiz submit exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
