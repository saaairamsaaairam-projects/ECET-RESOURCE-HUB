import { NextResponse } from "next/server";
import { getAdminClient, verifyAdminFromToken } from "@/utils/serverAuth";

// lightweight quiz type used by APIs and pages
interface QuizRow {
  id: string;
  title: string;
  name?: string;
  description?: string;
  mode?: string;
  topic_id?: string;
  total_questions?: number;
  duration_minutes?: number;
  subject_folder_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subjectFolderId = searchParams.get("subjectFolderId");

    const client = getAdminClient();

    // single quiz lookup
    if (id) {
      const { data, error } = await client
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();  // topic_id will be included automatically

      if (error) {
        console.error("GET /api/quiz/list (by id) error:", error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (data) data.name = data.title || data.name;
      return NextResponse.json(data || null);
    }

    // list of quizzes (optionally filtered by subject folder)
    let query = client.from("quizzes").select("*");
    if (subjectFolderId) {
      query = query.eq("subject_folder_id", subjectFolderId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/quiz/list error:", error);
      return NextResponse.json([], { status: 500 });
    }

    const quizzes = (data || []).map((q) => ({ ...q, name: q.title || q.name }));

    return NextResponse.json({ quizzes });
  } catch (err) {
    console.error("GET /api/quiz/list exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // admin only
  const userId = await verifyAdminFromToken(req as any);
  if (!userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing quiz id" }, { status: 400 });
    }

    const { error } = await getAdminClient().from("quizzes").delete().eq("id", id);
    if (error) {
      console.error("DELETE /api/quiz/list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/quiz/list exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
