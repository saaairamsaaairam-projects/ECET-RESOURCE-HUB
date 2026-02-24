"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StartQuizPage() {
  const router = useRouter();
  const { quizId } = useParams() as { quizId: string };
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartQuiz() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quiz/attempt/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          userId: user?.id || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to start quiz");
        setLoading(false);
        return;
      }

      router.replace(`/quiz/${quizId}/attempt?attempt=${json.attemptId}`);
    } catch (err) {
      console.error("Start quiz error:", err);
      setError("Failed to start quiz. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Ready to Start?</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Once you start, you'll enter fullscreen exam mode. You can answer questions,
          save your answers instantly, and navigate freely. Click below when ready.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 rounded-lg font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition mb-3"
        >
          {loading ? "Starting..." : "Start Quiz"}
        </button>

        <button
          onClick={() => router.back()}
          disabled={loading}
          className="w-full px-6 py-3 bg-gray-700 rounded-lg font-semibold text-white hover:bg-gray-600 disabled:opacity-50 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

