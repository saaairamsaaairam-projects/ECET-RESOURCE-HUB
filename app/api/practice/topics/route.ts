import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectFolderId = searchParams.get("subjectFolderId");

  try {
    const { data, error } = await getAdminClient()
      .from("practice_topics")
      .select("*")
      .eq("subject_folder_id", subjectFolderId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("GET /api/practice/topics error:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET /api/practice/topics exception:", err);
    return NextResponse.json([], { status: 500 });
  }
}
