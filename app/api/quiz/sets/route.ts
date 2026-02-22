import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, verifyAdminFromToken } from "@/utils/serverAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subjectFolderId = searchParams.get("subjectFolderId");

    // Fetch single quiz by ID (for quiz start/play/review pages)
    if (id) {
      const { data, error } = await getAdminClient()
        .from("quiz_sets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("GET /api/quiz/sets (by id) error:", error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json(data);
    }

    // Fetch all quizzes by subject folder (for admin quiz list page)
    const { data, error } = await getAdminClient()
      .from("quiz_sets")
      .select("*")
      .eq("subject_folder_id", subjectFolderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("GET /api/quiz/sets error:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET /api/quiz/sets exception:", err);
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
    if (!body.name || !body.subject_folder_id) {
      return NextResponse.json(
        { error: "Missing required fields: name, subject_folder_id" },
        { status: 400 }
      );
    }

    const { data, error } = await getAdminClient()
      .from("quiz_sets")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("POST /api/quiz/sets error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/quiz/sets exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await getAdminClient().from("quiz_sets").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/quiz/sets error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/quiz/sets exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
