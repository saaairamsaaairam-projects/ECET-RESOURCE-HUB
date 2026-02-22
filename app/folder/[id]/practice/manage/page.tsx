import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/getUserRole";
import { getAdminClient } from "@/utils/serverAuth";
import TopicManager from "./TopicManager";

export default async function ManagePracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🔐 SERVER-SIDE AUTH CHECK (FIRST)
  console.log("🔐 [manage/page.tsx] Checking admin role...");
  const role = await getUserRole();
  
  console.log("📊 [manage/page.tsx] Role result:", role);

  if (role !== "admin") {
    console.log("❌ [manage/page.tsx] Not admin, redirecting to home");
    redirect("/");
  }

  console.log("✅ [manage/page.tsx] User is admin, proceeding...");

  // 📋 FETCH TOPICS (only if admin)
  const { id: folderId } = await params;
  const adminClient = getAdminClient();
  
  try {
    const { data: topics } = await adminClient
      .from("practice_topics")
      .select("*")
      .eq("subject_folder_id", folderId)
      .order("order_index", { ascending: true });

    return (
      <TopicManager
        folderId={folderId}
        initialTopics={topics || []}
      />
    );
  } catch (err) {
    console.error("❌ [manage/page.tsx] Error fetching topics:", err);
    return (
      <TopicManager
        folderId={folderId}
        initialTopics={[]}
      />
    );
  }
}
