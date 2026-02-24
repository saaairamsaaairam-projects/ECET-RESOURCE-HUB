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
    const { folderId, title, questionIds } = body;

    if (!folderId || !title || !questionIds || questionIds.length === 0) {
      return badRequestResponse("Missing folderId, title, or questionIds");
    }

    // 1. Create quiz record
    const { data: quiz, error: createError } = await getAdminClient()
      .from("quizzes")
      .insert({
        subject_folder_id: folderId,
        title,
        total_questions: questionIds.length,
      })
      .select()
      .single();

    if (createError) {
      console.error("Quiz create error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Insert quiz questions mapping
    const insertRows = (questionIds as string[]).map((qid: string, idx: number) => ({
      quiz_id: quiz.id,
      practice_question_id: qid,
      order_index: idx,
    }));

    const { error: linkError } = await getAdminClient()
      .from("quiz_questions")
      .insert(insertRows);

    if (linkError) {
      console.error("Quiz questions link error:", linkError);
      // Quiz was created but linking failed — still return success
    }

    return NextResponse.json({ success: true, quizId: quiz.id });
  } catch (err: any) {
    console.error("POST /api/quiz/create exception:", err);
    return serverErrorResponse("Failed to create quiz");
  }
}
