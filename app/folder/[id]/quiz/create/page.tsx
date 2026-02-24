"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const folderId = params?.id as string;

  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  // Load topics for subject folder
  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch(`/api/practice-topics?folderId=${folderId}`);
        const json = await res.json();
        setTopics(json.topics || []);
      } catch (err) {
        console.error("Failed to load topics", err);
      } finally {
        setTopicsLoading(false);
      }
    }
    if (folderId) loadTopics();
  }, [folderId]);

  // Load questions when a topic is selected
  useEffect(() => {
    async function loadQuestions() {
      if (!selectedTopic) {
        setQuestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/practice-questions?topicId=${selectedTopic}`);
        const json = await res.json();
        setQuestions(json.questions || []);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    }
    loadQuestions();
  }, [selectedTopic]);

  const toggleQuestion = (q: any) => {
    if (selectedQuestions.find((x) => x.id === q.id)) {
      setSelectedQuestions(selectedQuestions.filter((x) => x.id !== q.id));
    } else {
      setSelectedQuestions([...selectedQuestions, q]);
    }
  };

  async function handleCreateQuiz() {
    if (!title.trim()) {
      alert("Quiz title is required!");
      return;
    }
    if (selectedQuestions.length === 0) {
      alert("Select at least 1 question!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId,
          title,
          questionIds: selectedQuestions.map((q) => q.id),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to create quiz");
        setLoading(false);
        return;
      }

      router.push(`/folder/${folderId}/quiz/manage/${json.quizId}`);
    } catch (err) {
      console.error("Create quiz error", err);
      alert("Failed to create quiz");
      setLoading(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

      {/* Quiz Title */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">Quiz Title</label>
        <input
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
          placeholder="Enter quiz name (e.g., 'Midterm Exam')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Topic Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">Select Topic</label>
        {topicsLoading ? (
          <p className="text-gray-400">Loading topics...</p>
        ) : (
          <select
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">-- Select a topic --</option>
            {topics.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Questions List */}
      {selectedTopic && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Available Questions ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <p className="text-gray-400">No questions found for this topic.</p>
          ) : (
            <div className="border border-gray-700 rounded-lg p-4 max-h-[500px] overflow-y-auto bg-gray-900">
              {questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q)}
                  className={`p-4 mb-3 rounded cursor-pointer transition ${
                    selectedQuestions.find((x) => x.id === q.id)
                      ? "bg-purple-700 border border-purple-500"
                      : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedQuestions.find((x) => x.id === q.id)
                        ? "bg-purple-600 border-purple-400"
                        : "border-gray-600"
                    }`}>
                      {selectedQuestions.find((x) => x.id === q.id) && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">Q{idx + 1}. {q.question}</p>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p>A) {q.option_a}</p>
                        <p>B) {q.option_b}</p>
                        <p>C) {q.option_c}</p>
                        <p>D) {q.option_d}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Count & Create Button */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-lg font-semibold">
          Selected Questions: <span className="text-purple-400">{selectedQuestions.length}</span>
        </div>
        <button
          onClick={handleCreateQuiz}
          disabled={loading || selectedQuestions.length === 0}
          className="px-6 py-3 bg-purple-600 rounded text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      </div>
    </div>
  );
}
