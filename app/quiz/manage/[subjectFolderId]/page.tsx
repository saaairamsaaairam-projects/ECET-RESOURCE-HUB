"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuizListPage({ params }: any) {
  const { subjectFolderId } = params || {};
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadQuizzes() {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/sets?subjectFolderId=${subjectFolderId}`);
      const data = await res.json();
      setQuizzes(data || []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuiz(id: string) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await fetch("/api/quiz/sets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }

    loadQuizzes();
  }

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.replace(`/quiz`);
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return <div className="p-6 text-center text-red-400 text-lg">Redirecting...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Quizzes</h1>

      <Link
        href={`/quiz/manage/${subjectFolderId}/new`}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        + Create New Quiz
      </Link>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-400">No quizzes created yet.</p>
        ) : (
          quizzes.map((quiz: any) => (
            <div key={quiz.id} className="p-4 border border-gray-700 rounded bg-gray-900 shadow">
              <h2 className="text-xl font-semibold mb-1">{quiz.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{quiz.description}</p>

              <div className="flex gap-3">
                <Link href={`/quiz/manage/questions/${quiz.id}`} className="text-blue-400 hover:underline">
                  Manage Questions
                </Link>

                <button onClick={() => deleteQuiz(quiz.id)} className="text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
