"use client";

import { useState } from "react";

export default function AddTopicModal({
  folderId,
  onClose,
}: {
  folderId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    console.log("AddTopicModal: submitting", { folderId, title });

    try {
      console.log("AddTopicModal POST payload:", { folderId, title });
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, title }),
      });

      console.log("Response status:", res.status, res.statusText);
      const text = await res.text();
      console.log("Raw response:", text);
      const json = text ? JSON.parse(text) : {};
      console.log("Parsed response:", json);

      if (!res.ok) {
        console.error("Failed to create topic:", json);
        setError(json?.error || "Failed to create topic");
        setSaving(false);
        return;
      }

      // success — close and refresh handled by parent
      onClose();
    } catch (err) {
      console.error("Failed to create topic:", err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-96 border border-purple-700">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Add New Topic</h2>

        <input
          className="w-full p-2 bg-black border border-gray-700 text-white rounded"
          placeholder="Topic name (ex: Variables)"
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
            className="px-4 py-2 bg-purple-700 rounded hover:bg-purple-800"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
