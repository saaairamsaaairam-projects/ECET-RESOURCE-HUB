import { redirect } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: topics } = await supabase
    .from("practice_topics")
    .select("id, slug")
    .eq("subject_folder_id", id)
    .order("order_index");

  if (!topics || topics.length === 0) {
    return (
      <div className="text-zinc-400 p-6">
        No practice topics available yet.
      </div>
    );
  }

  redirect(`/folder/${id}/practice/${topics[0].slug}`);
}
