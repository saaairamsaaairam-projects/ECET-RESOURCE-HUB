"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/quiz/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Failed to create quiz");
      setSaving(false);
      return;
    }

    router.push(`/quiz/manage/${json.quizId}`);
  }

  return (
    <main className="min-h-screen bg-[#0d0d13] text-white px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-[#15151d] border border-[#242432] rounded-2xl shadow-lg p-10">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-purple-400 mb-6">
          Create New Quiz
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          Create a custom quiz for your students. After creation, you can add questions,
          set time limits, attempts, and publish it.
        </p>

        {/* Form */}
        <div className="space-y-6">

          {/* Title Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Quiz Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#1e1e28] border border-[#2c2c3a] text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Example: Java Chapter-1 Mock Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Description (optional)
            </label>
            <textarea
              className="w-full bg-[#1e1e28] border border-[#2c2c3a] text-white rounded-xl px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Write a short description about this quiz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 font-medium">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all py-3 rounded-xl text-lg font-semibold flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating...
              </>
            ) : (
              "Create Quiz"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
