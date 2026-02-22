"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export default function SelectQuestionsPage() {
  const params = useParams();
  const folderId = params?.id as string;
  const search = useSearchParams();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const quizId = search.get("quiz");

  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!folderId) {
      setErrorMsg("Missing folder id in route");
      setLoading(false);
      return;
    }

    loadQuestions();
  }, []);

  // Load practice questions under this folder
  const loadQuestions = async () => {
    try {
      const res = await fetch(`/api/quiz/list-practice?folder=${encodeURIComponent(folderId)}`);
      const json = await res.json();
      setQuestions(json || []);
      if (!json || (Array.isArray(json) && json.length === 0)) {
        setErrorMsg("No practice questions found for this subject.");
      } else {
        setErrorMsg(null);
      }
    } catch (err) {
      setErrorMsg("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (q: any) => {
    if (selected.includes(q.id)) {
      setSelected(selected.filter((id) => id !== q.id));
    } else {
      setSelected([...selected, q.id]);
    }
  };

  const saveQuizQuestions = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const res = await fetch("/api/quiz/add-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        quiz_id: quizId,
        questions: selected,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || "Failed to save questions");
      return;
    }

    router.push(`/quiz/${quizId}/preview`);
  };

  if (!isAdmin) return <div className="p-5 text-red-500">Access Denied</div>;

  if (loading) return <div className="p-6">Loading questions...</div>;

  if (errorMsg) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold">Select Questions for Quiz</h2>
        <p className="text-gray-600 mt-4">{errorMsg}</p>
        <p className="text-sm text-gray-400 mt-2">folderId: {folderId}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold">Select Questions for Quiz</h2>

      <p className="text-gray-600">Choose the questions you want to include.</p>

      <div className="space-y-4">
        {questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className={`border p-4 rounded cursor-pointer ${
              selected.includes(q.id)
                ? "border-purple-600 bg-purple-50"
                : "border-gray-300"
            }`}
            onClick={() => toggleSelect(q)}
          >
            <div className="font-semibold">Q{index + 1}. {q.question}</div>

            <ul className="list-disc ml-5 text-sm text-gray-600 mt-2">
              <li>A: {q.option_a}</li>
              <li>B: {q.option_b}</li>
              <li>C: {q.option_c}</li>
              <li>D: {q.option_d}</li>
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={saveQuizQuestions}
        className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 mt-4"
      >
        Save & Continue →
      </button>
    </div>
  );
}
