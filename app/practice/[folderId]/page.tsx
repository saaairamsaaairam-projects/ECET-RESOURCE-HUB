import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;

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

  const { data: topics } = await supabase
    .from("practice_topics")
    .select("slug")
    .eq("subject_folder_id", folderId)
    .order("order_index", { ascending: true })
    .limit(1);

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No practice topics yet.</p>
        <p className="text-gray-500 mt-2">Ask an admin to add topics to get started.</p>
      </div>
    );
  }

  redirect(`/practice/${folderId}/${topics[0].slug}`);
}
