import TopicSidebar from "@/components/topics/TopicSidebar";

export default async function TopicsLayout({ children, params }: any) {
  const { id } = await params;

  return (
    <div className="flex w-full min-h-screen">
      <TopicSidebar folderId={id} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
