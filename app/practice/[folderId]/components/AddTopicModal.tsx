"use client";

import { useState } from "react";

export default function AddTopicModal({
  open,
  setOpen,
  folderId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  folderId: string;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function saveTopic() {
    if (!name.trim()) {
      setError("Topic name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, title: name }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to save topic");
        setSaving(false);
        return;
      }

      // Reset and close
      setName("");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#1a1a1a] border border-gray-700 p-8 rounded-xl w-96 shadow-2xl">
        <h2 className="font-bold text-xl mb-4 text-white">Add New Topic</h2>

        <input
          className="w-full border border-gray-600 bg-[#0f0f0f] text-white p-3 rounded-lg mb-4 focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Topic name (e.g., Variables, Functions)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTopic();
          }}
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            onClick={saveTopic}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Topic"}
          </button>

          <button
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            onClick={() => {
              setName("");
              setError("");
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
