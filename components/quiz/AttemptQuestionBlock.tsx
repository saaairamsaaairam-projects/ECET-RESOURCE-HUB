"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AttemptQuestionBlock({ quizId, page, initialAttemptId }: { quizId: string; page: number; initialAttemptId?: string | null; }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const search = useSearchParams();
  // if the server provided an attemptId, use it; otherwise read from URL
  const urlAttempt = search.get("attempt") || search.get("attemptId");
  const [attemptIdState, setAttemptIdState] = useState<string | null>(initialAttemptId || urlAttempt);
  const perPage = 5;
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    // keep state copy of attemptId so that transient loss of search param doesn't break
    const current = search.get("attempt") || search.get("attemptId");
    if (current && !attemptIdState) {
      setAttemptIdState(current);
    }

    async function load() {
      try {
        const url = new URL(`/api/quiz/attempt/status`, window.location.origin);
        url.searchParams.set("quizId", quizId);
        url.searchParams.set("page", String(page));
        const useId = attemptIdState || current;
        if (useId) url.searchParams.set("attempt", useId);

        console.debug("Attempt status fetch", url.toString());
        const res = await fetch(url.toString(), {
          credentials: "include",
        });
        const text = await res.text();
        let json: any;
        try {
          json = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error("Failed to parse /api/quiz/attempt/status response", e, text);
          json = {};
        }
        if (!res.ok) {
          console.error("/api/quiz/attempt/status returned error", res.status, json);
        }
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
  }, [quizId, page, attemptIdState, search]);

  async function saveAnswer(qId: string | undefined, selectedOption: string) {
    const currentAttempt = attemptIdState || (search.get("attempt") || search.get("attemptId"));
    if (!currentAttempt) {
      console.warn("saveAnswer blocked: no attempt id", { quizId, qId, selectedOption });
      alert("Unable to save answer: attempt not started or expired. Refresh page or restart quiz.");
      return;
    }
    if (!qId) {
      console.warn("saveAnswer blocked: missing question id", { quizId, currentAttempt, selectedOption });
      return;
    }

    // optimistic update
    setAnswers((p) => ({ ...p, [qId]: { ...(p[qId] || {}), selected_option: selectedOption } }));

    // log request details to help debug missing fields
    console.debug("saveAnswer request", { attemptId: currentAttempt, questionId: qId, selectedOption });

    try {
      const res = await fetch("/api/quiz/attempt/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: currentAttempt,
          questionId: qId,
          selectedOption
        }),
      });
      if (!res.ok) {
        let errJson;
        try { errJson = await res.json(); } catch { errJson = null; }
        console.error("saveAnswer returned non-ok", res.status, errJson);
        alert("Failed to save answer. Please try again.");
        // revert optimistic update on error
        setAnswers((p) => {
          const updated = { ...p };
          if (updated[qId]) delete updated[qId];
          return updated;
        });
      }
    } catch (err) {
      console.warn("Save answer failed", err);
      alert("Failed to save answer. Please try again.");
      // revert optimistic update on error
      setAnswers((p) => {
        const updated = { ...p };
        if (updated[qId]) delete updated[qId];
        return updated;
      });
    }
  }

  function goToPage(p: number) {
    const currentAttempt = attemptIdState || (search.get("attempt") || search.get("attemptId"));
    const attemptParam = currentAttempt ? `&attempt=${currentAttempt}` : "";
    router.push(`/quiz/${quizId}/attempt?page=${p}${attemptParam}`);
  }

  async function finishAttempt() {
    const currentAttempt = attemptIdState || (search.get("attempt") || search.get("attemptId"));
    if (!currentAttempt) {
      alert("No attempt id");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/attempt/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: currentAttempt, quizId }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("finishAttempt error", res.status, json);
        alert(json.error || "Failed to finish");
        setSubmitting(false);
        return;
      }
      // redirect to score page
      router.push(`/quiz/${quizId}/attempt/${currentAttempt}/score`);
    } catch (err) {
      console.error("Finish failed", err);
      alert("Failed to finish attempt");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-foreground">Loading questions...</div>;

  if (!questions.length) return <div className="p-8 text-center text-foreground">No questions found.</div>;

  return (
    <div className="flex flex-col bg-background text-foreground">
      <div className="grid gap-6 p-4">
        {questions.map((q: any, idx: number) => (
          <div key={q.id} className="p-6 bg-slate-900 dark:bg-slate-900 rounded-lg shadow border border-slate-700">
            {/* Question text - explicit white color for visibility in dark theme */}
            <div className="mb-4 text-lg font-bold text-white">
              Q{(page - 1) * perPage + idx + 1}. {q.question}
            </div>

            <div className="grid gap-3">
              {(["a", "b", "c", "d"] as const).map((opt) => {
                const text = q[`option_${opt}`];
                const isSelected = String(answers[q.id]?.selected_option || "") === opt;

                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-slate-600 bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => saveAnswer(q.id, opt)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{opt.toUpperCase()}.</div>
                      <div className="text-sm text-gray-300">{text}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 px-4 pb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={questions.length < perPage}
            className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={finishAttempt}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
