"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  name: string;
  description?: string;
}

export default function QuizPlay({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const search = useSearchParams();

  const page = parseInt(search.get("page") || "1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  async function loadQuiz() {
    try {
      const res = await fetch(`/api/quiz/sets?id=${quizId}`);
      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      console.error("Error loading quiz:", err);
    }
  }

  async function loadQuestions() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/quiz/questions?quizId=${quizId}&page=${page}&limit=5`
      );
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);

      // Load saved answers from localStorage
      const saved = JSON.parse(localStorage.getItem(`quiz_${quizId}`) || "{}");
      setAnswers(saved);
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qId: string, option: string) {
    const updated = { ...answers, [qId]: option };
    setAnswers(updated);
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(updated));
  }

  function goNext() {
    router.push(`/quiz/${quizId}/play?page=${page + 1}`);
  }

  function goPrev() {
    router.push(`/quiz/${quizId}/play?page=${page - 1}`);
  }

  function finishQuiz() {
    router.push(`/quiz/${quizId}/review`);
  }

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    loadQuestions();
  }, [page, quizId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">Loading questions...</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{quiz?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          Page {page} of {totalPages}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center text-gray-400">No questions found</div>
      ) : (
        questions.map((q, idx) => (
          <div
            key={q.id}
            className="mb-8 p-6 rounded bg-gray-900 border border-gray-700 hover:border-gray-600 transition"
          >
            <p className="font-semibold text-white mb-4 text-lg">
              Q{(page - 1) * 5 + idx + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {["A", "B", "C", "D"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(q.id, opt)}
                  className={`block w-full text-left p-3 rounded border transition
                    ${
                      answers[q.id] === opt
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750"
                    }
                  `}
                >
                  <span className="font-semibold mr-2">{opt})</span>
                  {(q as any)[`option_${opt.toLowerCase()}`]}
                </button>
              ))}
            </div>

            {q.explanation && answers[q.id] && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 border border-blue-700 rounded text-blue-100 text-sm">
                {q.explanation}
              </div>
            )}
          </div>
        ))
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-700">
        <div>
          {page > 1 ? (
            <button
              onClick={goPrev}
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              ← Previous
            </button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="text-gray-400 text-sm">
          {Object.keys(answers).length} / {questions.length} answered on this page
        </div>

        <div>
          {page < totalPages ? (
            <button
              onClick={goNext}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
