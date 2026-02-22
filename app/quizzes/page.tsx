"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/quiz/list`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setQuizzes(data || []);
      })
      .catch((e) => console.error("Failed to load quizzes", e))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Quizzes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.map((q) => (
          <div key={q.id} className="p-4 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-800 text-white shadow-lg">
            <h2 className="text-xl font-semibold">{q.title}</h2>
            <p className="text-sm text-purple-200 my-2">{q.description}</p>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
                <div>Mode: <b>{q.mode}</b></div>
                <div>Duration: <b>{q.duration_minutes || q.duration || 60}m</b></div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/quiz/${q.id}/instructions`} className="px-3 py-2 bg-white text-purple-800 rounded">Start</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
