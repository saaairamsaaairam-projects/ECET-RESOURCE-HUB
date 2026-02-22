"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Instructions({ params }: any) {
  const { quizId } = params;
  const router = useRouter();

  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/quiz/${quizId}/info`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((e) => console.error("Failed to load quiz info", e));
    return () => {
      mounted = false;
    };
  }, [quizId]);

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  const { quiz, totalQuestions } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-6">
      
      <div className="backdrop-blur-xl bg-white/8 border border-white/20 shadow-2xl rounded-3xl p-10 max-w-3xl w-full text-white">
        
        <h1 className="text-3xl font-extrabold mb-2">{quiz.title || quiz.name}</h1>
        <p className="text-purple-200 mb-6">Mode: <b>{(quiz.mode || "practice").toString().toUpperCase()}</b></p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white/10 rounded-xl border border-white/20 text-center">
            <p className="text-sm text-purple-200">Questions</p>
            <h2 className="text-2xl font-bold">{totalQuestions}</h2>
          </div>

          <div className="p-4 bg-white/10 rounded-xl border border-white/20 text-center">
            <p className="text-sm text-purple-200">Duration</p>
            <h2 className="text-2xl font-bold">{quiz.duration || quiz.time_limit || 0} min</h2>
          </div>

          <div className="p-4 bg-white/10 rounded-xl border border-white/20 text-center">
            <p className="text-sm text-purple-200">Attempts</p>
            <h2 className="text-2xl font-bold">{quiz.attempts_allowed || 1}</h2>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Instructions</h2>
        <ul className="text-purple-100 space-y-2 mb-8 text-sm">
          <li>• Answer questions sequentially or use the palette to jump.</li>
          <li>• Navigate with Next/Previous buttons.</li>
          <li>• Timer starts immediately in exam mode.</li>
          <li>• Auto-submit occurs when time expires.</li>
          <li>• Refreshing the page will NOT reset the timer.</li>
          <li>• Your progress is saved continuously.</li>
        </ul>

        <button
          onClick={() => router.push(`/quiz/${quizId}/start`)}
          className="w-full py-4 bg-white text-purple-800 font-bold rounded-2xl text-lg shadow-lg hover:bg-purple-100 transition-all"
        >
          Start Quiz
        </button>
      </div>

    </div>
  );
}
