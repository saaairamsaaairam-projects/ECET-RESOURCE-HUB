"use client";

import { useState } from "react";

export default function DeleteMCQButton({
  questionId,
  topicId,
  folderId,
  topicSlug,
  onReload,
}: {
  questionId: string;
  topicId: string;
  folderId: string;
  topicSlug: string;
  onReload?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function deleteMCQ() {
    if (!confirm("Are you sure you want to delete this question? This cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/practice-questions/${questionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete question");
        setDeleting(false);
        return;
      }

      if (onReload) {
        onReload();
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert("Network error. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={deleteMCQ}
      disabled={deleting}
      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
      title="Delete question"
    >
      🗑️
    </button>
  );
}
