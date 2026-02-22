"use client";

import { useState } from "react";

export default function EditTopicModal({
  topic,
  onClose,
}: {
  topic: any;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(topic.title || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, title }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Failed to update topic:", json);
        setError(json?.error || "Failed to update topic");
        setSaving(false);
        return;
      }

      onClose();
    } catch (err) {
      console.error("Failed to update topic:", err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-96 border border-purple-700">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Edit Topic</h2>

        <input
          className="w-full p-2 bg-black border border-gray-700 text-white rounded"
          placeholder="Topic name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {error && (
          <div className="text-red-400 text-sm mb-3 bg-red-400/10 border border-red-400/20 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
