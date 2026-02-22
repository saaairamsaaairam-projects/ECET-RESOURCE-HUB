"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuizIndex() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchQuizzes() {
      try {
        const res = await fetch(`/api/quiz/list`);
        const status = res.status;
        const text = await res.text();

        // Log raw response for debugging
        console.log("/api/quiz/list status:", status);
        console.log("/api/quiz/list raw text:", text);

        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (err) {
          console.error("Failed to parse /api/quiz/list JSON:", err);
        }

        if (!mounted) return;

        if (Array.isArray(data)) {
          setQuizzes(data);
        } else if (data && Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
        } else if (data && data.error) {
          console.error("/api/quiz/list returned error:", data.error);
          setQuizzes([]);
        } else {
          console.error("Unexpected /api/quiz/list response (parsed):", data);
          setQuizzes([]);
        }
      } catch (e) {
        console.error("Failed to load quizzes", e);
        if (mounted) setQuizzes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchQuizzes();

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
