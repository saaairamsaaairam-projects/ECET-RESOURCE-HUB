import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, verifyAdminFromToken, badRequestResponse, forbiddenResponse } from "@/utils/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { id, topic_id } = body;
    if (!id) {
      return badRequestResponse("Missing quiz id");
    }

    const updates: any = {};
    if (topic_id !== undefined) updates.topic_id = topic_id;

    const { data, error } = await getAdminClient()
      .from("quizzes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("quiz update error", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, quiz: data });
  } catch (err) {
    console.error("POST /api/quiz/update exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
