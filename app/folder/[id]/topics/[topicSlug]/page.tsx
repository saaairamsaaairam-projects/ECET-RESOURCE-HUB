import TopicContent from "@/components/topics/TopicContent";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function TopicPage({ params }: any) {
  const { id, topicSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in server component
          }
        },
      },
    }
  );

  const { data: topic } = await supabase
    .from("practice_topics")
    .select("id, name")
    .eq("subject_folder_id", id)
    .eq("slug", topicSlug)
    .single();

  if (!topic) return notFound();

  // Fetch topic content from practice_topic_content table
  const { data: contentData } = await supabase
    .from("practice_topic_content")
    .select("content")
    .eq("topic_id", topic.id)
    .single();

  const initialContent = contentData?.content || "";

  return <TopicContent folderId={id} topic={topic} initialContent={initialContent} />;
}
