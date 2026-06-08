import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminFromToken,
  getAdminClient,
  badRequestResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/utils/serverAuth";
import { getUserRole } from "@/utils/getUserRole";

export async function POST(req: NextRequest) {
  try {
    const role = await getUserRole();
    if (role !== "admin") {
      return forbiddenResponse();
    }

    const body = await req.json();
    const {
      name,
      topic_id: topicId,
      subject_folder_id: folderId,
      mode,
      description,
    } = body;

    // minimal validation: we need a folder and name at least
    if (!folderId || !name) {
      return badRequestResponse("Missing subject_folder_id or name");
    }

    // assemble insert object; include topic_id if provided
    const newQuizRow: any = {
      subject_folder_id: folderId,
      title: name,
      mode: mode || "practice",
      description: description || null,
      total_questions: 0,
    };
    if (topicId) newQuizRow.topic_id = topicId;

    // create quiz row with metadata; no questions yet
    const { data: quiz, error: createError } = await getAdminClient()
      .from("quizzes")
      .insert(newQuizRow)
      .select()
      .single();

    if (createError) {
      console.error("Quiz create error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // topicId is stored on quizzes; nothing further required here

    return NextResponse.json({ success: true, id: quiz.id, quiz });
  } catch (err: any) {
    console.error("POST /api/quiz/create exception:", err);
    return serverErrorResponse("Failed to create quiz");
  }
}
