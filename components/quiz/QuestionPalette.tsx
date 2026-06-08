"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function QuestionPalette({ quizId }: { quizId: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const search = useSearchParams();
  const urlAttempt = search.get("attempt") || search.get("attemptId");
  const [attemptIdState, setAttemptIdState] = useState<string | null>(urlAttempt);

  useEffect(() => {
    let mounted = true;
    // sync state copy of id
    const current = search.get("attempt") || search.get("attemptId");
    if (current && !attemptIdState) setAttemptIdState(current);

    // if we don't yet know an attempt ID, wait for the next render when
    // search (or attemptIdState) changes. this prevents a needless 404 fetch
    if (!current && !attemptIdState) {
      // do not call load
      return () => { mounted = false; };
    }

    async function load() {
      try {
        const useId = attemptIdState || current;
        const url = new URL(`/api/quiz/attempt/status`, window.location.origin);
        url.searchParams.set("quizId", quizId);
        if (useId) url.searchParams.set("attempt", useId);

        console.debug("Palette status fetch", url.toString());
        const res = await fetch(url.toString(), {
          credentials: "include",
        });
        const text = await res.text();
        let json: any;
        try {
          json = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error("Failed to parse /api/quiz/attempt/status (palette) response", e, text);
          json = {};
        }
        if (!res.ok) {
          console.error("/api/quiz/attempt/status (palette) returned error", res.status, json);
        }
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
  }, [quizId, attemptIdState, search]);

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
            href={`?page=${Math.floor(idx / 5) + 1}${attemptIdState ? `&attempt=${attemptIdState}` : ""}`}
            className={`w-10 h-10 flex items-center justify-center text-white rounded ${getColor(q)}`}
          >
            {q.question_number || idx + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
