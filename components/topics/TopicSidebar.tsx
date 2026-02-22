"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";
import AddTopicModal from "./modals/AddTopicModal";
import EditTopicModal from "./modals/EditTopicModal";

export default function TopicSidebar({ folderId }: { folderId: string }) {
  const [topics, setTopics] = useState<any[]>([]);
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTopic, setEditTopic] = useState<any | null>(null);

  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  async function loadTopics() {
    try {
      const { data } = await supabase
        .from("practice_topics")
        .select("*")
        .eq("subject_folder_id", folderId)
        .order("order_index");

      setTopics(data || []);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setTopics([]);
    }
  }

  async function deleteTopic(topicId: string) {
    if (!confirm("Delete topic permanently?")) return;

    try {
      await fetch("/api/topics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      loadTopics();
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  }

  return (
    <div className="w-64 border-r border-gray-700 bg-[#0f0f0f] h-screen overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-3 text-purple-400">Topics</h2>

      {topics.map((topic) => (
        <div key={topic.id} className="group flex items-center mb-1">
          <Link
            href={`/folder/${folderId}/topics/${topic.slug}`}
            className={`flex-1 p-2 rounded ${
              pathname?.includes(topic.slug)
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-purple-800"
            }`}
          >
            {topic.name}
          </Link>

          {isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 transition ml-2 flex gap-2">
              <button
                onClick={() => setEditTopic(topic)}
                className="text-yellow-400"
                aria-label={`Edit ${topic.name}`}
              >
                ✏
              </button>
              <button
                onClick={() => deleteTopic(topic.id)}
                className="text-red-500"
                aria-label={`Delete ${topic.name}`}
              >
                🗑
              </button>
            </div>
          )}
        </div>
      ))}

      {isAdmin && (
        <button
          className="mt-4 w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800"
          onClick={() => setShowAddModal(true)}
        >
          + Add Topic
        </button>
      )}

      {showAddModal && (
        <AddTopicModal
          folderId={String(folderId)}
          onClose={() => {
            setShowAddModal(false);
            loadTopics();
          }}
        />
      )}

      {editTopic && (
        <EditTopicModal
          topic={editTopic}
          onClose={() => {
            setEditTopic(null);
            loadTopics();
          }}
        />
      )}
    </div>
  );
}
