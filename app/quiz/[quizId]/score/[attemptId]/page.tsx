"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScorePage({ params }: any) {
  const { quizId, attemptId } = params;

  const [data, setData] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch(`/api/quiz/${quizId}/score/${attemptId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((e) => console.error("Failed to load score", e));

    return () => {
      mounted = false;
    };
  }, [quizId, attemptId]);

  if (!data) return <div className="p-10 text-center">Loading score...</div>;

  if (data.error) return <div className="p-10 text-center text-red-400">{data.error}</div>;

  const { quiz, attempt, correct, wrong, unanswered, total } = data;
  const percentage = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-6 text-white">

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 max-w-3xl w-full">

        <h1 className="text-3xl font-extrabold mb-2">{quiz.name || quiz.title}</h1>

        <p className="text-purple-200 mb-6">You completed this quiz.</p>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="absolute top-0 left-0 w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="70"
                stroke="#ffffff40"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="70"
                stroke="#7c3aed"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${percentage * 4.4} 440`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
              {percentage}%
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-center">
            <p className="text-sm text-green-200">Correct</p>
            <h2 className="text-2xl font-bold">{correct}</h2>
          </div>

          <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-center">
            <p className="text-sm text-red-200">Wrong</p>
            <h2 className="text-2xl font-bold">{wrong}</h2>
          </div>

          <div className="p-4 bg-gray-500/20 border border-gray-400/30 rounded-xl text-center">
            <p className="text-sm text-gray-200">Unanswered</p>
            <h2 className="text-2xl font-bold">{unanswered}</h2>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          {quiz.show_review && (
            <button
              onClick={() => router.push(`/quiz/${quizId}/review/${attemptId}`)}
              className="w-full py-3 bg-white text-purple-800 font-bold rounded-xl hover:bg-purple-100 transition-all"
            >
              Review Answers
            </button>
          )}

          <button
            onClick={() => router.push(`/dashboard`)}
            className="w-full py-3 bg-purple-800 font-bold rounded-xl hover:bg-purple-900 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
