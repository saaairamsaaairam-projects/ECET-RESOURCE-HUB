import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import SidebarTopics from "@/app/practice/[folderId]/components/SidebarTopics";

export default async function PracticeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const { data: folder } = await supabase
    .from("folders")
    .select("name")
    .eq("id", folderId)
    .single();

  const { data: topics } = await supabase
    .from("practice_topics")
    .select("*")
    .eq("subject_folder_id", folderId)
    .order("order_index", { ascending: true });

  return (
    <div className="flex w-full bg-[#0f0f0f] text-white min-h-screen">
      {/* Sidebar */}
      <SidebarTopics folderId={folderId} topics={topics || []} folderName={folder?.name} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-700 bg-[#1a1a1a] p-4 sticky top-0 z-10">
          <Link
            href={`/folder/${folderId}`}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to {folder?.name}
          </Link>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
