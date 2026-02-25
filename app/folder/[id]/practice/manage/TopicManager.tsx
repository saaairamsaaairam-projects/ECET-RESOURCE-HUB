"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug: string;
  order_index: number;
}

interface Props {
  folderId: string;
  initialTopics: Topic[];
}

export default function TopicManager({ folderId, initialTopics }: Props) {
  const [topicList, setTopicList] = useState(initialTopics);
  const [newTopic, setNewTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // No auth checks needed - server already verified admin access

  async function createTopic() {
    if (!newTopic.trim()) return;

    setIsCreating(true);

    try {
      const slug = newTopic
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const { data, error } = await supabase
        .from("practice_topics")
        .insert({
          name: newTopic.trim(),
          slug,
          subject_folder_id: folderId,
          order_index: topicList.length,
        })
        .select()
        .single();

      if (!error && data) {
        setTopicList([...topicList, data]);
        setNewTopic("");
        setCreateError(null);
      }
    } catch (err) {
      console.error("Error creating topic:", err);
      setCreateError(String(err));
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteTopic(id: string) {
    try {
      await supabase.from("practice_topics").delete().eq("id", id);
      setTopicList(topicList.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting topic:", err);
    }
  }

  async function renameTopic(id: string, newName: string) {
    if (!newName.trim()) return;

    try {
      const slug = newName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const { data } = await supabase
        .from("practice_topics")
        .update({ name: newName.trim(), slug })
        .eq("id", id)
        .select()
        .single();

      if (data) {
        setTopicList(
          topicList.map((t) => (t.id === id ? data : t))
        );
      }
    } catch (err) {
      console.error("Error renaming topic:", err);
    }
  }

  // No auth checks here; server already validated access for manager

  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Practice Topic Manager
            </h1>
            <p className="text-zinc-400">
              Create and manage practice topics for this subject
            </p>
          </div>
          <Link
            href={`/folder/${folderId}/practice`}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
          >
            ← Back to Practice
          </Link>
        </div>

        {/* Create Topic Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Topic</h2>
          <div className="flex gap-3">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isCreating) {
                      createTopic();
                    }
                  }}
              placeholder="Topic name (e.g., Object-Oriented Programming)"
              disabled={isCreating}
              className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-700 focus:border-violet-500 outline-none disabled:opacity-50 transition"
            />
            <button
              onClick={createTopic}
              disabled={isCreating || !newTopic.trim()}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Create
            </button>
          </div>
          {createError && (
            <p className="text-red-400 text-sm mt-3">{createError}</p>
          )}
        </div>

        {/* Topics List */}
        <div className="space-y-3">
          {topicList.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-zinc-400">No topics yet. Create one above!</p>
            </div>
          ) : (
            topicList.map((topic, index) => (
              <div
                key={topic.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-semibold w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-white font-semibold">{topic.name}</h3>
                      <p className="text-zinc-500 text-sm">/{topic.slug}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/folder/${folderId}/practice/manage/${topic.id}`}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition"
                    title="Manage questions"
                  >
                    <Edit2 size={18} />
                  </Link>

                  <button
                    onClick={() => setDeleteConfirm(topic.id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition"
                    title="Delete topic"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#0f0e17] border border-white/10 rounded-xl p-6 max-w-sm">
              <h3 className="text-xl font-bold text-white mb-4">
                Delete Topic?
              </h3>
              <p className="text-zinc-400 mb-6">
                This will delete the topic and all its questions. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm) {
                      deleteTopic(deleteConfirm);
                      setDeleteConfirm(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
