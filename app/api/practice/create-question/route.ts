import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("POST /api/practice/create-question body:", body);
    const admin = getAdminClient();

    const { data: topic } = await admin
      .from("practice_topics")
      .select("id")
      .eq("subject_folder_id", body.folderId)
      .eq("slug", body.topicSlug)
      .single();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const { data: inserted, error } = await admin.from("practice_questions").insert({
      topic_id: topic.id,
      question: body.question,
      option_a: body.a,
      option_b: body.b,
      option_c: body.c,
      option_d: body.d,
      correct_option: body.correct_option,
      explanation: body.explanation,
    }).select().single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message || error }, { status: 400 });
    }

    console.log("Inserted question id:", inserted?.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
