import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const subject = searchParams.get("subject");
  const topicSlug = searchParams.get("topic");
  const page = Number(searchParams.get("page") || 1);

  const { data: topic } = await supabase
    .from("practice_topics")
    .select("id")
    .eq("slug", topicSlug)
    .single();

  const { data } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("topic_id", topic?.id)
    .range((page - 1) * 10, page * 10 - 1);

  return Response.json(data);
}
