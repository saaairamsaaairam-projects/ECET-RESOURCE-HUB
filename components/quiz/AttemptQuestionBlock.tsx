"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AttemptQuestionBlock({ quizId, page }: { quizId: string; page: number }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const search = useSearchParams();
  const attemptId = search.get("attempt") || search.get("attemptId");
  const perPage = 5;
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    async function load() {
      try {
        const url = new URL(`/api/quiz/attempt/status`, window.location.origin);
        url.searchParams.set("quizId", quizId);
        url.searchParams.set("page", String(page));
        if (attemptId) url.searchParams.set("attempt", attemptId);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (!mountedRef.current) return;
        setQuestions(json.questions || []);
        const map: Record<string, any> = {};
        (json.answers || []).forEach((a: any) => (map[a.question_id] = a));
        setAnswers(map);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    load();
    return () => { mountedRef.current = false; };
  }, [quizId, page, attemptId]);

  async function saveAnswer(qId: string, option: string) {
    if (!attemptId) {
      alert("Attempt not started");
      return;
    }

    // optimistic update
    setAnswers((p) => ({ ...p, [qId]: { ...(p[qId] || {}), user_answer: option } }));

    try {
      await fetch(`/api/quiz/${quizId}/attempt/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, option }),
      });
    } catch (err) {
      console.warn("Save answer failed", err);
    }
  }

  function goToPage(p: number) {
    router.push(`/quiz/${quizId}/attempt?page=${p}${attemptId ? `&attempt=${attemptId}` : ""}`);
  }

  async function finishAttempt() {
    if (!attemptId) return alert("No attempt id");
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/attempt/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, quizId }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to finish");
        setSubmitting(false);
        return;
      }
      // redirect to score page
      router.push(`/quiz/${quizId}/attempt/${attemptId}/score`);
    } catch (err) {
      console.error("Finish failed", err);
      alert("Failed to finish attempt");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading questions...</div>;

  if (!questions.length) return <div className="p-8 text-center">No questions found.</div>;

  return (
    <div className="flex flex-col">
      <div className="grid gap-6">
        {questions.map((q: any, idx: number) => (
          <div key={q.id} className="p-4 bg-white rounded-lg shadow">
            <div className="mb-3 font-bold">Q{(page - 1) * perPage + idx + 1}. {q.question}</div>

            <div className="grid gap-3">
              {(["a","b","c","d"] as const).map((opt) => {
                const text = q[`option_${opt}`];
                const isSelected = String(answers[q.id]?.user_answer || "") === opt;

                return (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                    <input type="radio" name={`q_${q.id}`} checked={isSelected} onChange={() => saveAnswer(q.id, opt)} />
                    <div>
                      <div className="font-semibold">{opt.toUpperCase()}.</div>
                      <div className="text-sm">{text}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button onClick={() => goToPage(page + 1)} disabled={questions.length < perPage} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>

        <div className="flex gap-2">
          <button onClick={finishAttempt} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">{submitting ? 'Submitting...' : 'Finish'}</button>
        </div>
      </div>
    </div>
  );
}
