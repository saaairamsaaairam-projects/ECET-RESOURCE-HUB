"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function QuestionPalette({ quizId }: { quizId: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const search = useSearchParams();
  const attemptId = search.get("attempt") || search.get("attemptId");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const url = new URL(`/api/quiz/attempt/status`, window.location.origin);
        url.searchParams.set("quizId", quizId);
        if (attemptId) url.searchParams.set("attempt", attemptId);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (!mounted) return;
        setQuestions(json.questions || []);

        const map: Record<string, any> = {};
        (json.answers || []).forEach((a: any) => (map[a.question_id] = a));
        setAnswers(map);
      } catch (err) {
        console.error("Failed to load palette", err);
      }
    }
    load();
    return () => { mounted = false; };
  }, [quizId, attemptId]);

  function getColor(q: any) {
    const a = answers[q.id];
    if (!a) return "bg-blue-300"; // not visited
    if (a.is_marked) return "bg-purple-400";
    if (a.user_answer == null || a.user_answer === "") return "bg-red-400";
    return "bg-green-400";
  }

  return (
    <div>
      <h2 className="font-semibold mb-3">Question Palette</h2>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => (
          <a
            key={q.id}
            href={`?page=${Math.floor(idx / 5) + 1}${attemptId ? `&attempt=${attemptId}` : ""}`}
            className={`w-10 h-10 flex items-center justify-center text-white rounded ${getColor(q)}`}
          >
            {q.question_number || idx + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
