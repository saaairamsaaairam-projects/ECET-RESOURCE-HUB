"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ManageQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const folderId = params?.id as string;
  const quizId = params?.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quiz/info?quizId=${quizId}`);
        const json = await res.json();
        setQuiz(json.quiz);
        setQuestions(json.questions || []);
      } catch (err) {
        console.error("Failed to load quiz", err);
      } finally {
        setLoading(false);
      }
    }
    if (quizId) loadQuiz();
  }, [quizId]);

  if (!isAdmin) return null;
  if (loading) return <div className="p-6 text-center">Loading quiz...</div>;
  if (!quiz) return <div className="p-6 text-center">Quiz not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-gray-400 mb-6">Total Questions: {questions.length}</p>

      <div className="flex gap-3 mb-6">
        <Link
          href={`/folder/${folderId}/quiz`}
          className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-700"
        >
          Back to Quiz List
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Questions in this Quiz</h2>
      {questions.length === 0 ? (
        <p className="text-gray-400">No questions added yet.</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q: any, idx: number) => (
            <div key={q.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="font-medium">Q{idx + 1}. {q.question}</p>
              <p className="text-sm text-gray-400 mt-2">
                A) {q.option_a}
              </p>
              <p className="text-sm text-gray-400">
                B) {q.option_b}
              </p>
              <p className="text-sm text-gray-400">
                C) {q.option_c}
              </p>
              <p className="text-sm text-gray-400">
                D) {q.option_d}
              </p>
              <p className="text-sm text-green-400 mt-2">
                ✓ Correct: {q.correct_answer?.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
