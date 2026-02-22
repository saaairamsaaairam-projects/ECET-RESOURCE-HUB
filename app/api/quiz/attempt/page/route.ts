import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const page = Number(searchParams.get("page") || "1");
    const userId = searchParams.get("userId");

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Get latest attempt for this user/quiz
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (attErr || !attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Determine question range
    const offset = (page - 1) * 5;

    // Load 5 questions
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("question_number", { ascending: true })
      .range(offset, offset + 4);

    if (qErr) {
      console.error("page: failed to load questions", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // Load existing answers
    const { data: answers, error: ansErr } = await supabase
      .from("quiz_attempt_answers")
      .select("*")
      .eq("attempt_id", attempt.id);

    if (ansErr) console.error("page: failed to load answers", ansErr);

    const ansMap: Record<number, any> = {};
    (answers || []).forEach((a: any) => {
      ansMap[a.question_number] = a;
    });

    return NextResponse.json({ questions: questions || [], answers: ansMap, attemptId: attempt.id });
  } catch (err) {
    console.error("GET /api/quiz/attempt/page exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quizId");
    const page = Number(url.searchParams.get("page") || "1");
    const attempt = url.searchParams.get("attempt") || url.searchParams.get("attemptId");

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // fetch mappings
    const { data: mappings, error: mapErr } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mapErr) {
      console.error("GET /api/quiz/attempt/page - mapping error", mapErr);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }

    const qIds = (mappings || []).map((m: any) => m.practice_question_id);

    const { data: questionsRaw, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer")
      .in("id", qIds || []);

    if (qErr) {
      console.error("GET /api/quiz/attempt/page - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    const ordered = (mappings || []).map((m: any, idx: number) => {
      const q = (questionsRaw || []).find((x: any) => x.id === m.practice_question_id);
      return { ...(q || {}), question_number: idx + 1, order_index: m.order_index };
    }).filter(Boolean);

    const perPage = 5;
    const start = (page - 1) * perPage;
    const pageQuestions = ordered.slice(start, start + perPage);

    let answers: any[] = [];
    if (attempt) {
      const { data: ansRows, error: aErr } = await getAdminClient()
        .from("quiz_attempt_answers")
        .select("*")
        .eq("attempt_id", attempt);
      if (aErr) {
        console.error("GET /api/quiz/attempt/page - answers fetch error", aErr);
      } else {
        answers = ansRows || [];
      }
    }

    // convert answers to map keyed by question_number
    const answersMap: Record<number, any> = {};
    answers.forEach((a: any) => {
      const idx = ordered.findIndex((q: any) => q.id === a.question_id);
      if (idx >= 0) answersMap[idx + 1] = a;
    });

    return NextResponse.json({ questions: pageQuestions, answers: answersMap });
  } catch (err) {
    console.error("GET /api/quiz/attempt/page exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
