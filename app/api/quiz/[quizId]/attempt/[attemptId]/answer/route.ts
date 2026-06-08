import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: NextRequest, ctx: any) {
  const params = await ctx.params;
  console.debug("ENTER /api/quiz/[quizId]/attempt/[attemptId]/answer POST", req.url);
  try {
    const { attemptId } = params;
    const textBody = await req.text();
    console.debug("raw body text:", textBody);
    let body: any;
    try {
      body = JSON.parse(textBody);
    } catch {
      body = {};
    }
    const { questionId, option } = body;

    // diagnostic logging helps track down bogus payloads
    console.debug("POST /answer payload", { attemptId, questionId, option });

    // both values are required; option itself may legitimately be null/undefined when
    // clearing an answer, so we only validate the questionId/attemptId here.
    if (!attemptId || !questionId) {
      console.error("POST /answer bad request, missing fields", {
        attemptId,
        questionId,
        option,
        body,
      });
      // return all values explicitly (undefined -> null in JSON) so client can see what was missing
      return NextResponse.json(
        { error: "Missing fields", attemptId: attemptId ?? null, questionId: questionId ?? null, option: option ?? null },
        { status: 400 }
      );
    }

    // use admin client so we don't get blocked by RLS when anokey is used
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("quiz_attempt_answers")
      .upsert(
        [{ attempt_id: attemptId, question_id: questionId, selected_option: option }],
        { onConflict: "attempt_id,question_id" }
      );

    if (error) {
      console.error("POST save answer error", error);
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /answer exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
