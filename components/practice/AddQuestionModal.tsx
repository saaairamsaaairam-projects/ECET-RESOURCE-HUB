"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddQuestionModal({ open, onClose, topicSlug, folderId }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    try {
      console.log("Creating question", { folderId, topicSlug });
      const res = await fetch("/api/practice/create-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId,
          topicSlug,
          question: form.get("question"),
          a: form.get("a"),
          b: form.get("b"),
          c: form.get("c"),
          d: form.get("d"),
          correct_option: form.get("correct"),
          explanation: form.get("explanation"),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("Create question failed:", json);
        toast.error(json.error || "Failed to add question");
        setLoading(false);
        return;
      }

      toast.success("Question added!");
      setLoading(false);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Create question exception:", err);
      toast.error("Network or server error");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white text-black p-6 rounded w-full max-w-xl space-y-4">
        <h2 className="text-xl font-bold">Add New Question</h2>

        <textarea name="question" placeholder="Question text..." className="w-full border p-2 rounded" required />

        <input name="a" placeholder="Option A" className="w-full border p-2 rounded" required />
        <input name="b" placeholder="Option B" className="w-full border p-2 rounded" required />
        <input name="c" placeholder="Option C" className="w-full border p-2 rounded" required />
        <input name="d" placeholder="Option D" className="w-full border p-2 rounded" required />

        <select name="correct" className="w-full border p-2 rounded" required>
          <option value="">Select correct option</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>

        <textarea name="explanation" placeholder="Explanation (optional)" className="w-full border p-2 rounded" />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
