import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminFromToken,
  getAdminClient,
  badRequestResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/utils/serverAuth";

export async function POST(req: NextRequest) {
  const userId = await verifyAdminFromToken(req);
  if (!userId) return forbiddenResponse();

  const body = await req.json();

  if (!body.folder_id || !body.title) {
    return badRequestResponse("Missing folder_id or title");
  }

  try {
    const { data, error } = await getAdminClient()
      .from("quiz_list")
      .insert({
        folder_id: body.folder_id,
        title: body.title,
        mode: body.mode,
        total_questions: body.total_questions,
        duration: body.duration,
        status: "draft",
        created_by: userId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error }, { status: 400 });

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    console.error("Quiz create error:", err);
    return serverErrorResponse("Failed to create quiz");
  }
}
