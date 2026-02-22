"use client";

import { useEffect, useState } from "react";

export default function ReviewPage({ params }: any) {
  const { quizId, attemptId } = params;

  const [data, setData] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 1; // 1 question per page

  useEffect(() => {
    let mounted = true;
    fetch(`/api/quiz/${quizId}/review/${attemptId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((e) => console.error("Failed to load review", e));

    return () => {
      mounted = false;
    };
  }, [quizId, attemptId]);

  if (!data) return <div className="p-10 text-center">Loading review...</div>;

  if (data.error) return <div className="p-10 text-center text-red-400">{data.error}</div>;

  const { quiz, attempt, questions, answers } = data;

  const startIndex = (page - 1) * perPage;
  const q = questions[startIndex];
  if (!q) return <div className="p-10 text-center">No questions found.</div>;
  const selected = answers[q.id];
  const correct = q.correct_answer;

  return (
    <div className="flex w-full min-h-screen bg-gray-900 text-white">

      {/* LEFT SIDEBAR — palette */}
      <div className="w-1/5 border-r p-4">
        <h2 className="font-bold text-lg mb-3">Questions</h2>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question: any, i: number) => {
            const qNum = i + 1;
            const s = answers[question.id];
            const isCorrect = s && String(s).toUpperCase() === String(question.correct_answer).toUpperCase();

            return (
              <button
                key={question.id}
                onClick={() => setPage(qNum)}
                className={`rounded-full w-8 h-8 text-sm flex items-center justify-center ${
                  s == null ? "bg-slate-500" : isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {qNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER — Question */}
      <div className="w-3/5 p-8">
        {/* Score Summary only on first question */}
        {page === 1 && quiz.show_score !== false && (
          <div className="mb-6 p-4 bg-purple-800/30 rounded-xl border border-purple-700">
            <h1 className="text-xl font-bold text-white">{quiz.name || quiz.title}</h1>
            <p className="text-lg mt-1">Score: <span className="font-bold">{attempt.score}</span> / {questions.length}</p>
          </div>
        )}

        <h2 className="font-bold mb-4 text-lg">Q{page}. {q.question}</h2>

        <div className="flex flex-col gap-3">
          {["a","b","c","d"].map((opt) => {
            const text = q[`option_${opt}`];
            const isSelected = String(selected) === opt;
            const isCorrectOpt = String(correct) === opt;

            return (
              <div
                key={opt}
                className={`p-3 rounded border ${isCorrectOpt ? "bg-green-900/30 border-green-600" : "bg-gray-800"} ${!isCorrectOpt && isSelected ? "bg-red-900/30 border-red-600" : ""}`}
              >
                <b>{opt.toUpperCase()}.</b> {text}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="mt-6 p-4 bg-gray-800 border rounded-xl">
          <h3 className="font-bold mb-2">Explanation</h3>
          <p className="text-gray-300">{q.explanation || "No explanation provided."}</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex gap-2 items-center">
            {Array.from({ length: questions.length }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-2 py-1 rounded ${page === i + 1 ? "bg-purple-600 text-white" : "bg-gray-700"}`}>
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === questions.length}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* RIGHT — summary */}
      <div className="w-1/5 border-l p-4">
        <h2 className="font-bold text-lg mb-3">Summary</h2>

        <p>Total Questions: {questions.length}</p>
        <p>Score: {attempt.score}</p>
      </div>
    </div>
  );
}
