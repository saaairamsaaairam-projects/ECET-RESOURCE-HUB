import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET(req: Request, ctx: any) {
  try {
    const { params } = ctx;
    const { subjectId } = params || {};
    const client = getAdminClient();

    const { data: quizzes, error } = await client
      .from("quizzes")
      .select("*")
      .eq("subject_folder_id", subjectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/quiz/list/[subjectId] error", error);
      return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
    }

    return NextResponse.json(quizzes || []);
  } catch (err) {
    console.error("GET /api/quiz/list/[subjectId] exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
