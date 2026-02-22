"use client";

import { useState } from "react";

export default function AddMCQModal({
  open,
  setOpen,
  topicId,
  topicSlug,
  folderId,
  onReload,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  topicId: string;
  topicSlug: string;
  folderId: string;
  onReload?: () => void;
}) {
  const [formData, setFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function saveMCQ() {
    // Validation
    if (
      !formData.question.trim() ||
      !formData.option_a.trim() ||
      !formData.option_b.trim() ||
      !formData.option_c.trim() ||
      !formData.option_d.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/practice-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: topicId,
          ...formData,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to save question");
        setSaving(false);
        return;
      }

      // Success - reload or reset
      if (onReload) {
        onReload();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 overflow-y-auto py-6">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white">Add New Question</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="What is the question?"
              rows={3}
              className="w-full border border-gray-600 bg-[#0f0f0f] text-white p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {["option_a", "option_b", "option_c", "option_d"].map((opt, idx) => (
              <div key={opt}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option {String.fromCharCode(65 + idx)}
                </label>
                <input
                  type="text"
                  name={opt}
                  value={formData[opt as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="w-full border border-gray-600 bg-[#0f0f0f] text-white p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Correct Option */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correct Answer
            </label>
            <select
              name="correct_option"
              value={formData.correct_option}
              onChange={handleChange}
              className="w-full border border-gray-600 bg-[#0f0f0f] text-white p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Why is this the correct answer?"
              rows={3}
              className="w-full border border-gray-600 bg-[#0f0f0f] text-white p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex gap-3">
          <button
            onClick={saveMCQ}
            disabled={saving}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Question"}
          </button>

          <button
            onClick={() => {
              setFormData({
                question: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_option: "A",
                explanation: "",
              });
              setError("");
              setOpen(false);
            }}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
