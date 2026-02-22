"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function QuizBuilderPage() {
  const params = useParams();
  const folderId = params?.id as string;
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("exam");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [duration, setDuration] = useState(30);

  if (!user || !isAdmin) return <div className="p-5 text-red-600">Access Denied</div>;

  const createQuiz = async () => {
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;

    const res = await fetch("/api/quiz/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        folder_id: folderId,
        title,
        mode,
        total_questions: totalQuestions,
        duration,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    // Redirect to question selection
    router.push(`/folder/${folderId}/quiz/manage/select-questions?quiz=${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-bold">Create New Quiz</h1>

      <div className="space-y-4">

        <div>
          <label className="font-semibold">Quiz Title</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: C Programming Test - 1"
          />
        </div>

        <div>
          <label className="font-semibold">Mode</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="exam">Exam Mode</option>
            <option value="learning">Learning Mode</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Total Questions</label>
          <input
            type="number"
            className="w-full border p-2 rounded mt-1"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
          />
        </div>

        {mode === "exam" && (
          <div>
            <label className="font-semibold">Duration (minutes)</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        )}

        <button
          onClick={createQuiz}
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
        >
          Next → Select Questions
        </button>

      </div>
    </div>
  );
}
