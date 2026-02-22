"use client";

import { useEffect, useState } from "react";

export default function ExamHeader({ quizId }: { quizId: string }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); // seconds

  // Fetch quiz info
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/quiz/info?quizId=${quizId}`);
        const json = await res.json();
        if (!mounted) return;
        setQuizTitle(json.title || json.name || "Quiz");
        const minutes = json.duration_minutes || json.duration || json.duration_min || 60;
        setTimeLeft((minutes || 60) * 60);
      } catch (err) {
        console.error("Failed to load quiz info", err);
      }
    }
    load();
    return () => { mounted = false; };
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <header className="w-full bg-white border-b flex items-center justify-between px-6 py-3 shadow">
      <h1 className="text-xl font-semibold text-gray-800">{quizTitle}</h1>

      <div className="text-2xl font-bold text-red-600">
        {minutes}:{String(seconds).padStart(2, "0")}
      </div>
    </header>
  );
}
