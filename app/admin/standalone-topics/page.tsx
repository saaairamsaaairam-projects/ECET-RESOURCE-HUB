"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { StandaloneTopic } from "@/types/database";
import Link from "next/link";

export default function StandaloneTopicsAdmin() {
  const { isAdmin } = useAuth();
  const [topics, setTopics] = useState<StandaloneTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<StandaloneTopic | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchTopics();
    }
  }, [isAdmin]);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/standalone-topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/standalone-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: "", description: "" });
        setShowCreateForm(false);
        fetchTopics();
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    try {
      const response = await fetch("/api/standalone-topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTopic.id,
          ...formData,
        }),
      });

      if (response.ok) {
        setEditingTopic(null);
        setFormData({ title: "", description: "" });
        fetchTopics();
      }
    } catch (error) {
      console.error("Failed to update topic:", error);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      const response = await fetch("/api/standalone-topics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: topicId }),
      });

      if (response.ok) {
        fetchTopics();
      }
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  const togglePublished = async (topic: StandaloneTopic) => {
    try {
      const response = await fetch("/api/standalone-topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: topic.id,
          published: !topic.published,
        }),
      });

      if (response.ok) {
        fetchTopics();
      }
    } catch (error) {
      console.error("Failed to toggle published status:", error);
    }
  };

  const startEdit = (topic: StandaloneTopic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setFormData({ title: "", description: "" });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Standalone Topics Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {showCreateForm ? "Cancel" : "+ New Topic"}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-[#1a1a2e] border border-gray-600 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Topic</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0e17] border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0e17] border border-gray-600 rounded-lg text-white h-24"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create Topic
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {editingTopic && (
          <div className="bg-[#1a1a2e] border border-gray-600 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Topic</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0e17] border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0e17] border border-gray-600 rounded-lg text-white h-24"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Update Topic
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No topics created yet.</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="bg-[#1a1a2e] border border-gray-600 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-purple-400 mb-2">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-gray-300 mb-2">{topic.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Created: {new Date(topic.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded text-xs ${topic.published ? 'bg-green-600' : 'bg-red-600'}`}>
                        {topic.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      View
                    </Link>
                    <Link
                      href={`/topics/${topic.slug}/edit`}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      Edit Content
                    </Link>
                    <button
                      onClick={() => startEdit(topic)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublished(topic)}
                      className={`px-3 py-1 text-white rounded transition text-sm ${
                        topic.published
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {topic.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}