"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { Plus, Loader } from "lucide-react";

interface Props {
  topic: any;
  folderId: string;
}

export default function PracticeLayout({ topic, folderId }: Props) {
  const [topics, setTopics] = useState<any[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  useEffect(() => {
    async function loadTopics() {
      const { data } = await supabase
        .from("practice_topics")
        .select("*")
        .eq("subject_folder_id", folderId)
        .order("order_index");

      setTopics(data || []);
    }

    loadTopics();
  }, [folderId]);

  async function handleCreateTopic() {
    if (!newTopic.trim()) {
      setCreateError("Topic name cannot be empty");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/practice-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_folder_id: folderId,
          name: newTopic.trim(),
          slug: newTopic
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTopics([...topics, created]);
        setNewTopic("");
        setCreateError("");
      } else {
        const error = await res.json();
        setCreateError(error.error || "Failed to create topic");
      }
    } catch (err: any) {
      setCreateError(err.message || "An error occurred");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-zinc-700 min-h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Topics</h3>
          {isAdmin && (
            <Link
              href={`/folder/${folderId}/practice/manage`}
              className="text-xs px-2 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded transition"
              title="Go to admin management page"
            >
              Manage
            </Link>
          )}
        </div>

        {isAdmin && (
          <div className="mb-4 pb-4 border-b border-zinc-700">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreateTopic();
                }
              }}
              placeholder="New topic name..."
              disabled={isCreating}
              className="w-full bg-zinc-800 text-sm p-2 rounded mb-2 text-white placeholder-zinc-500 disabled:opacity-50"
            />
            <button
              onClick={handleCreateTopic}
              disabled={isCreating}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition"
            >
              {isCreating ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Topic
                </>
              )}
            </button>
            {createError && (
              <p className="text-red-400 text-xs mt-2">{createError}</p>
            )}
          </div>
        )}

        {topics.map((t, index) => {
          const active = pathname.includes(t.slug);

          return (
            <Link
              key={t.id}
              href={`/folder/${folderId}/practice/${t.slug}`}
              className={`block py-2 px-3 rounded text-sm ${
                active
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {String(index + 1).padStart(2, "0")}. {t.name}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">{topic.name}</h2>

        <p className="text-zinc-400">Questions will load here next.</p>
      </div>
    </div>
  );
}
