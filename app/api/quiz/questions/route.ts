import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, verifyAdminFromToken } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const quizId = searchParams.get("quizId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const all = searchParams.get("all") === "true";

    console.debug("GET /api/quiz/questions called", { quizId, page, limit, all });

    // select columns from mapping + practice questions
    const selectCols = `id, quiz_id, practice_question_id, order_index, created_at,
      practice_questions(question, option_a, option_b, option_c, option_d, correct_option, explanation)`;

    // Fetch all questions without pagination (for review page)
    if (all) {
      const { data, error } = await getAdminClient()
        .from("quiz_questions")
        .select(selectCols)
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("GET /api/quiz/questions (all) error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.debug("GET /api/quiz/questions (all) returned rows", data);
      // flatten to front-end shape
      const flat = (data || []).map((row: any) => ({
        id: row.id,
        question: row.practice_questions?.question || "",
        option_a: row.practice_questions?.option_a || "",
        option_b: row.practice_questions?.option_b || "",
        option_c: row.practice_questions?.option_c || "",
        option_d: row.practice_questions?.option_d || "",
        correct_answer: row.practice_questions?.correct_option || "",
        explanation: row.practice_questions?.explanation || "",
      }));

      return NextResponse.json({
        questions: flat,
      });
    }

    // paginated
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await getAdminClient()
      .from("quiz_questions")
      .select(selectCols, { count: "exact" })
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true })
      .range(start, end);

    if (error) {
      console.error("GET /api/quiz/questions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.debug("GET /api/quiz/questions page returned", data);
    const flat = (data || []).map((row: any) => ({
      id: row.id,
      question: row.practice_questions?.question || "",
      option_a: row.practice_questions?.option_a || "",
      option_b: row.practice_questions?.option_b || "",
      option_c: row.practice_questions?.option_c || "",
      option_d: row.practice_questions?.option_d || "",
      correct_answer: row.practice_questions?.correct_option || "",
      explanation: row.practice_questions?.explanation || "",
    }));

    return NextResponse.json({
      questions: flat,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    });
  } catch (err) {
    console.error("GET /api/quiz/questions exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Verify admin access
  const userId = await verifyAdminFromToken(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Validate required fields
    const { quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, practice_question_id } = body;

    console.debug("POST /api/quiz/questions", { quiz_id, question: !!question, option_a: !!option_a, option_b: !!option_b, option_c: !!option_c, option_d: !!option_d, correct_answer, explanation: !!explanation });

    if (!quiz_id) {
      console.error("POST /api/quiz/questions: Missing quiz_id");
      return NextResponse.json({ error: "Missing quiz_id" }, { status: 400 });
    }

    let pq: any = null;

    if (practice_question_id) {
      // use existing practice question
      pq = { id: practice_question_id };
      console.debug("POST /api/quiz/questions: Using existing practice_question_id", practice_question_id);
    } else {
      if (!question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
        console.error("POST /api/quiz/questions: Missing required question fields", {
          question: !!question,
          option_a: !!option_a,
          option_b: !!option_b,
          option_c: !!option_c,
          option_d: !!option_d,
          correct_answer: !!correct_answer,
        });
        return NextResponse.json({ error: "Missing required question data" }, { status: 400 });
      }

      // create new practice question
      const { data: pqData, error: pqErr } = await getAdminClient()
        .from("practice_questions")
        .insert({
          topic_id: null,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option: correct_answer,
          explanation: explanation || null,
        })
        .select()
        .single();

      if (pqErr) {
        console.error("POST /api/quiz/questions: practice_question insert error", pqErr);
        return NextResponse.json({ error: `Failed to create practice question: ${pqErr.message}` }, { status: 500 });
      }

      pq = pqData;
      console.debug("POST /api/quiz/questions: Created practice_question", { id: pq.id });
    }

    // Verify the quiz exists
    const { data: quizExists, error: quizCheckErr } = await getAdminClient()
      .from("quizzes")
      .select("id")
      .eq("id", quiz_id)
      .single();

    if (quizCheckErr || !quizExists) {
      console.error("POST /api/quiz/questions: quiz not found", { quiz_id, quizCheckErr });
      return NextResponse.json({ error: `Quiz not found: ${quiz_id}` }, { status: 404 });
    }

    // create mapping row
    const { data: mapData, error } = await getAdminClient()
      .from("quiz_questions")
      .insert({
        quiz_id,
        practice_question_id: pq.id,
        order_index: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/quiz/questions: quiz_questions insert error", error);
      return NextResponse.json({ error: `Failed to add question: ${error.message}` }, { status: 500 });
    }

    console.debug("POST /api/quiz/questions: Success", { mapId: mapData.id });

    // respond with combined info
    return NextResponse.json({
      ...mapData,
      ...pq,
      question: pq.question,
      option_a: pq.option_a,
      option_b: pq.option_b,
      option_c: pq.option_c,
      option_d: pq.option_d,
      correct_answer: pq.correct_option,
      explanation: pq.explanation,
    });
  } catch (err) {
    console.error("POST /api/quiz/questions exception:", err);
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Verify admin access
  const userId = await verifyAdminFromToken(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const { error } = await getAdminClient()
      .from("quiz_questions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/quiz/questions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/quiz/questions exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
