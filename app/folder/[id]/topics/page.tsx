import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function TopicsHome({ params }: any) {
  const { id } = await params;
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

  const { data: topics } = await supabase
    .from("practice_topics")
    .select("*")
    .eq("subject_folder_id", id)
    .order("order_index");

  if (!topics || topics.length === 0)
    return <div className="text-white text-lg">No topics added yet.</div>;

  redirect(`/folder/${id}/topics/${topics[0].slug}`);
}
