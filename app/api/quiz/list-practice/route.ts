import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  if (!folder) return NextResponse.json([]);

  // Load all practice_topics for this folder
  const { data: topics } = await supabase
    .from("practice_topics")
    .select("id")
    .eq("subject_folder_id", folder);

  if (!topics) return NextResponse.json([]);

  const topicIds = topics.map((t: any) => t.id);

  // Load corresponding practice questions
  const { data: questions } = await supabase
    .from("practice_questions")
    .select("*")
    .in("topic_id", topicIds)
    .order("created_at", { ascending: true });

  return NextResponse.json(questions || []);
}
