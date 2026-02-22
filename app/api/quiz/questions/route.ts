import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, verifyAdminFromToken } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const quizId = searchParams.get("quizId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const all = searchParams.get("all") === "true";

    // Fetch all questions without pagination (for review page)
    if (all) {
      const { data, error } = await getAdminClient()
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("GET /api/quiz/questions (all) error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        questions: data || [],
      });
    }

    // Fetch paginated questions (for play page or admin pages)
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await getAdminClient()
      .from("quiz_questions")
      .select("*", { count: "exact" })
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true })
      .range(start, end);

    if (error) {
      console.error("GET /api/quiz/questions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      questions: data || [],
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
    if (!body.quiz_id || !body.question) {
      return NextResponse.json(
        { error: "Missing required fields: quiz_id, question" },
        { status: 400 }
      );
    }

    const { data, error } = await getAdminClient()
      .from("quiz_questions")
      .insert({
        quiz_id: body.quiz_id,
        question: body.question,
        option_a: body.option_a,
        option_b: body.option_b,
        option_c: body.option_c,
        option_d: body.option_d,
        correct_answer: body.correct_answer,
        explanation: body.explanation || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/quiz/questions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/quiz/questions exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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
