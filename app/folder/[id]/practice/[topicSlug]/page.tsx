import PracticeLayout from "@/components/practice/PracticeLayout";
import { supabase } from "@/utils/supabase";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string; topicSlug: string }>;
}) {
  const { id, topicSlug } = await params;

  const { data: topic } = await supabase
    .from("practice_topics")
    .select("*")
    .eq("subject_folder_id", id)
    .eq("slug", topicSlug)
    .single();

  if (!topic) {
    return <div className="p-6 text-red-400">Topic not found.</div>;
  }

  return <PracticeLayout topic={topic} folderId={id} />;
}
