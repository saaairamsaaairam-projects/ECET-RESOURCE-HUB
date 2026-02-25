import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import QuestionList from "@/components/practice/QuestionList";

export default async function TopicPracticePage({
  params,
}: {
  params: Promise<{ folderId: string; topicSlug: string }>;
}) {
  const { folderId, topicSlug } = await params;

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
            // ignore
          }
        },
      },
    }
  );

  // Fetch topic
  const { data: topic } = await supabase
    .from("practice_topics")
    .select("id, name, slug")
    .eq("subject_folder_id", folderId)
    .eq("slug", topicSlug)
    .single();

  if (!topic) return notFound();

  // Fetch all questions for this topic
  const { data: questions } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("topic_id", topic.id)
    .order("id", { ascending: true });

  // Debug: log questions count to server console
  try {
     
    console.log(
      `TopicPracticePage: topic=${topic?.id} topicSlug=${topicSlug} questions=${(questions || []).length}`
    );
  } catch (e) {
    // ignore
  }

  // Check if user is admin (default to false for server component)
  let isAdmin = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.id) {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single();

      isAdmin = !!adminRow;
    }
  } catch (e) {
    // ignore and leave isAdmin false
  }

  return (
    <QuestionList
      topicId={topic.id}
      topicSlug={topicSlug}
      folderId={folderId}
    />
  );
}
