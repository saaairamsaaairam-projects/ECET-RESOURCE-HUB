"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewQuizPage() {
  const params = useSearchParams();
  const attemptId = params.get("attempt");
  const [load, setLoad] = useState(true);
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!attemptId) return;
    let mounted = true;
    fetch(`/api/quiz/review?attempt=${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setAttempt(data.attempt || null);
        setQuestions(data.questions || []);
        setAnswers(data.answers || []);
        setLoad(false);
      })
      .catch((e) => {
        console.error("Failed to load review", e);
        setLoad(false);
      });

    return () => {
      mounted = false;
    };
  }, [attemptId]);

  if (load) return <div className="p-10 text-xl">Loading Review...</div>;
  if (!attempt) return <div className="p-6 text-red-400">Error loading attempt.</div>;

  const answersMap = (answers || []).reduce((acc: any, a: any) => {
    acc[a.question_id] = a;
    return acc;
  }, {} as Record<string, any>);

  const current = questions[activeIndex];
  if (!current) return <div className="p-6">No questions found.</div>;
  const ans = answersMap[current.id] || {};

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-64 border-r border-gray-700 p-4 h-screen overflow-y-auto bg-black/30">
        <h2 className="text-xl font-bold mb-4">Questions</h2>

        <div className="grid grid-cols-8 gap-2">
          {questions.map((q: any, idx: number) => {
            const a = answersMap[q.id] || {};
            const userAnswer = a.user_answer || null;
            const isCorrect = a.is_correct === true || (userAnswer && String(userAnswer).toUpperCase() === String(q.correct_answer).toUpperCase());
            const color = !userAnswer
              ? "bg-gray-600"
              : isCorrect
              ? "bg-green-600"
              : "bg-red-600";

            return (
              <button
                key={idx}
                className={`p-2 rounded text-white ${color}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Question {activeIndex + 1}</h1>

        <p className="text-lg mb-6">{current.question}</p>

        {/* OPTIONS */}
        {(["a","b","c","d"] as const).map((opt) => {
          const optKey = `option_${opt}`;
          const isCorrect = String(current.correct_answer) === opt;
          const isUser = String(ans.user_answer || "") === opt;

          let classes = "p-4 rounded-lg mb-3 border ";

          if (isCorrect) classes += "border-green-500 bg-green-900 text-white";
          else if (isUser && !isCorrect) classes += "border-red-500 bg-red-900 text-white";
          else classes += "border-gray-600 bg-gray-800 text-gray-200";

          return (
            <div key={opt} className={classes}>
              <strong>{opt.toUpperCase()}:</strong> {current[optKey]}
            </div>
          );
        })}

        {/* Explanation */}
        <div className="mt-6 p-4 bg-gray-800 border rounded-xl">
          <h3 className="font-bold mb-2">Explanation</h3>
          <p className="text-gray-300">{current.explanation || "No explanation provided."}</p>
        </div>
      </div>
    </div>
  );
}
