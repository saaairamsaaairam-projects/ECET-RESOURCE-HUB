"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddTopicModal from "@/app/practice/[folderId]/components/AddTopicModal";

export default function SidebarTopics({
  folderId,
  topics,
  folderName,
}: {
  folderId: string;
  topics: any[];
  folderName?: string;
}) {
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="w-72 bg-[#1a1a1a] border-r border-gray-700 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white truncate">{folderName || "Practice"}</h2>
        <p className="text-xs text-gray-400 mt-1">Practice Questions</p>
      </div>

      {/* Add Topic Button */}
      {isAdmin && (
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Add Topic
          </button>
        </div>
      )}

      {/* Topics List */}
      <div className="flex-1 p-4 space-y-2">
        {topics.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No topics yet</p>
        ) : (
          topics.map((topic) => {
            const isActive = pathname.includes(topic.slug);
            return (
              <Link
                key={topic.id}
                href={`/practice/${folderId}/${topic.slug}`}
                className={`block p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <p className="font-medium truncate">{topic.name}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* Add Topic Modal */}
      <AddTopicModal
        open={modalOpen}
        setOpen={setModalOpen}
        folderId={folderId}
      />
    </div>
  );
}
