import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const userId = searchParams.get("userId");

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // Get attempt
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .single();

    if (attErr || !attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Get all answers
    const { data: answers, error: ansErr } = await supabase
      .from("quiz_attempt_answers")
      .select("*")
      .eq("attempt_id", attempt.id)
      .order("question_number");

    if (ansErr) console.error("status: failed to load answers", ansErr);

    // Get questions for numbering
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("question_number");

    if (qErr) console.error("status: failed to load questions", qErr);

    return NextResponse.json({ questions: questions || [], answers: answers || [] });
  } catch (err) {
    console.error("GET /api/quiz/attempt/status exception:", err);
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
    const attempt = url.searchParams.get("attempt");

    if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

    // load mappings -> practice_questions
    const { data: mappings, error: mapErr } = await getAdminClient()
      .from("quiz_questions")
      .select("practice_question_id, order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (mapErr) {
      console.error("GET /api/quiz/attempt/status - mapping error", mapErr);
      return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }

    const qIds = (mappings || []).map((m: any) => m.practice_question_id);

    const { data: questionsRaw, error: qErr } = await getAdminClient()
      .from("practice_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer")
      .in("id", qIds || []);

    if (qErr) {
      console.error("GET /api/quiz/attempt/status - questions fetch error", qErr);
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }

    // order questions according to mappings
    const ordered = (mappings || []).map((m: any, idx: number) => {
      const q = (questionsRaw || []).find((x: any) => x.id === m.practice_question_id);
      return { ...(q || {}), question_number: idx + 1, order_index: m.order_index };
    }).filter(Boolean);

    // paging (5 per page)
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
        console.error("GET /api/quiz/attempt/status - answers fetch error", aErr);
      } else {
        answers = ansRows || [];
      }
    }

    return NextResponse.json({ questions: ordered, pageQuestions, answers });
  } catch (err) {
    console.error("GET /api/quiz/attempt/status exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
