"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function SubjectQuizzes({ params }: any) {
  // `params` is a promise in client components under Next.js 16 — unwrap with `use()`
  const resolvedParams = use(params as Promise<{ subjectId: string }>);
  const { subjectId } = resolvedParams;
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/quiz/list/${subjectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setQuizzes(data || []);
      })
      .catch((e) => console.error("Failed to load subject quizzes", e))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;

  if (!quizzes.length) return <div className="p-8 text-center">No quizzes created yet for this subject.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Quizzes</h1>

      <div className="space-y-4">
        {quizzes.map((q) => (
          <div key={q.id} className="p-4 rounded-lg border bg-gray-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{q.title}</h2>
                <p className="text-sm text-gray-300">Mode: {q.mode} • Duration: {q.duration_minutes || q.duration || 60}m</p>
              </div>

              <div>
                <Link href={`/quiz/${q.id}/instructions`} className="px-3 py-2 bg-purple-600 rounded">Start</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
