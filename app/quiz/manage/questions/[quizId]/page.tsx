"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function ManageQuizQuestionsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Quiz questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Practice questions selector state
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [selectedPracticeQuestions, setSelectedPracticeQuestions] = useState<Set<string>>(new Set());
  const [showPracticeSelector, setShowPracticeSelector] = useState(false);
  // list of available topics so admin can assign a quiz topic
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [assignTopicId, setAssignTopicId] = useState("" as string);

  // New question form state
  const [newQ, setNewQ] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    explanation: "",
  });

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/questions?quizId=${quizId}&page=${page}`);
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load questions", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  // quiz metadata stored here after initial load
  const [quizMeta, setQuizMeta] = useState<any>(null);
  // when the quizMeta loads, prefill assignTopicId in case we need to show the
  // topic assignment form below
  useEffect(() => {
    if (quizMeta && quizMeta.topic_id) {
      setAssignTopicId(quizMeta.topic_id);
    }
  }, [quizMeta]);

  async function loadQuizMeta() {
    try {
      const res = await fetch(`/api/quiz/list?id=${quizId}`);
      const data = await res.json();
      setQuizMeta(data || null);
    } catch (err) {
      console.error("Failed to load quiz metadata", err);
      setQuizMeta(null);
    }
  }

  async function loadPracticeQuestions() {
    setPracticeLoading(true);
    try {
      // ensure we have metadata
      if (!quizMeta) {
        await loadQuizMeta();
      }

      if (!quizMeta?.topic_id) {
        // this should rarely happen now that the UI prevents opening the
        // selector without a topic, but we keep the check for safety
        alert("This quiz has no topic associated. Please assign a topic first.");
        return;
      }

      // Load practice questions for this topic
      const res = await fetch(`/api/practice-questions?topic_id=${quizMeta.topic_id}&page=1&limit=100`);
      const data = await res.json();
      setPracticeQuestions(data.questions || []);
    } catch (err) {
      console.error("Failed to load practice questions", err);
      alert("Failed to load practice questions");
    } finally {
      setPracticeLoading(false);
    }
  }

  async function addQuestion() {
    if (!newQ.question.trim() || !newQ.option_a.trim() || !newQ.option_b.trim() || !newQ.option_c.trim() || !newQ.option_d.trim() || !newQ.correct_answer.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/quiz/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify({ 
          quiz_id: quizId, 
          ...newQ,
          correct_answer: newQ.correct_answer.toUpperCase(),
        }),
      });

      const data_res = await res.json();
      if (res.ok) {
        setNewQ({
          question: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "",
          explanation: "",
        });
        loadQuestions();
      } else {
        console.error("Failed to add question", res.status, data_res);
        alert(data_res.error || `Failed to add question (${res.status})`);
      }
    } catch (err) {
      console.error("Add question error", err);
      alert(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function addPracticeQuestionsToQuiz() {
    if (selectedPracticeQuestions.size === 0) {
      alert("Please select at least one question");
      return;
    }

    try {
      // Add each selected question
      
      for (const question of practiceQuestions) {
        if (selectedPracticeQuestions.has(question.id)) {
          const res = await fetch("/api/quiz/questions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              quiz_id: quizId,
              practice_question_id: question.id,
            }),
          });

          if (!res.ok) {
            const error = await res.json();
            console.error("Failed to add question:", error);
          }
        }
      }

      alert(`Added ${selectedPracticeQuestions.size} question(s) to quiz`);
      setSelectedPracticeQuestions(new Set());
      setShowPracticeSelector(false);
      loadQuestions();
    } catch (err) {
      console.error("Error adding practice questions", err);
      alert("Failed to add questions");
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    try {
      const res = await fetch("/api/quiz/questions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        loadQuestions();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete question");
      }
    } catch (err) {
      console.error("Delete question error", err);
      alert("Network error");
    }
  }

  async function updateQuizTopic(topicId: string) {
    try {
      const res = await fetch("/api/quiz/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: quizId, topic_id: topicId }),
      });
      const result = await res.json();
      if (res.ok) {
        setQuizMeta(result.quiz);
        setAssignTopicId("");
        alert("Topic assigned to quiz");
      } else {
        console.error("Failed to update quiz topic", result);
        alert(result.error || "Failed to assign topic");
      }
    } catch (err) {
      console.error("updateQuizTopic error", err);
      alert("Network error");
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [page]);

  useEffect(() => {
    // load quiz metadata and available topics when page mounts
    loadQuizMeta();
    async function fetchTopics() {
      try {
        const res = await fetch(`/api/practice/topics?subjectFolderId=`); // no filter needed, backend just returns all
        const data = await res.json();
        setAllTopics(data || []);
      } catch (e) {
        console.error("Failed to load all topics", e);
      }
    }
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      // redirect non-admin users to the public quiz page
      router.replace(`/quiz/${quizId}`);
    }
  }, [isAdmin, quizId, router]);

  if (!isAdmin) {
    return <div className="p-6 text-red-400">Redirecting...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Quiz Questions</h1>

      {/* topic assignment warning/form */}
      {quizMeta && !quizMeta.topic_id && (
        <div className="mb-6 p-4 bg-yellow-900 rounded border border-yellow-700">
          <p className="text-yellow-200 mb-2">
            This quiz has no topic associated. You must assign a topic before
            you can bulk‑add practice questions.
          </p>
          <div className="flex gap-2 items-center">
            <select
              value={assignTopicId}
              onChange={(e) => setAssignTopicId(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded p-2"
            >
              <option value="">Select topic...</option>
              {allTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.title || t.id}
                </option>
              ))}
            </select>
            <button
              disabled={!assignTopicId}
              onClick={() => updateQuizTopic(assignTopicId)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Tab-like buttons */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
        <button
          onClick={() => setShowPracticeSelector(false)}
          className={`px-4 py-2 rounded font-semibold transition ${
            !showPracticeSelector
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Add New Question
        </button>
        <button
          onClick={() => {
            if (!quizMeta?.topic_id) return; // guard
            setShowPracticeSelector(true);
            if (practiceQuestions.length === 0) {
              loadPracticeQuestions();
            }
          }}
          disabled={!quizMeta?.topic_id}
          className={`px-4 py-2 rounded font-semibold transition ${
            showPracticeSelector
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          } ${!quizMeta?.topic_id ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Select from Practice
        </button>
      </div>

      {/* Add New Question Section */}
      {!showPracticeSelector && (
        <div className="border border-gray-700 p-6 rounded bg-gray-900 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Question</h2>

          <textarea
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-3 text-white placeholder-gray-500"
            placeholder="Question"
            rows={3}
            value={newQ.question}
            onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
          />

          {["a", "b", "c", "d"].map((opt) => (
            <input
              key={opt}
              type="text"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-2 text-white placeholder-gray-500"
              placeholder={`Option ${opt.toUpperCase()}`}
              value={newQ[`option_${opt}` as keyof typeof newQ]}
              onChange={(e) =>
                setNewQ({ ...newQ, [`option_${opt}`]: e.target.value })
              }
            />
          ))}

          <input
            type="text"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-2 text-white placeholder-gray-500"
            placeholder="Correct Answer (A/B/C/D)"
            value={newQ.correct_answer}
            onChange={(e) =>
              setNewQ({ ...newQ, correct_answer: e.target.value.toUpperCase() })
            }
          />

          <textarea
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-3 text-white placeholder-gray-500"
            placeholder="Explanation (optional)"
            rows={2}
            value={newQ.explanation}
            onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
          />

          <button
            onClick={addQuestion}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold transition"
          >
            + Add Question
          </button>
        </div>
      )}

      {/* Select from Practice Questions Section */}
      {showPracticeSelector && (
        <div className="border border-gray-700 p-6 rounded bg-gray-900 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select from Practice Questions</h2>

          {practiceLoading ? (
            <p className="text-gray-400">Loading practice questions...</p>
          ) : practiceQuestions.length === 0 ? (
            <p className="text-gray-400">No practice questions found for this topic.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {practiceQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 bg-gray-800 border border-gray-700 rounded hover:border-gray-600 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPracticeQuestions.has(q.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedPracticeQuestions);
                        if (e.target.checked) {
                          newSelected.add(q.id);
                        } else {
                          newSelected.delete(q.id);
                        }
                        setSelectedPracticeQuestions(newSelected);
                      }}
                      className="mt-1 w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2">{q.question}</p>
                      <ul className="text-sm text-gray-300 space-y-1 ml-4">
                        <li>A) {q.option_a}</li>
                        <li>B) {q.option_b}</li>
                        <li>C) {q.option_c}</li>
                        <li>D) {q.option_d}</li>
                      </ul>
                      <p className="text-xs text-green-400 mt-2">Correct: {q.correct_option}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addPracticeQuestionsToQuiz}
                  disabled={selectedPracticeQuestions.size === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  + Add {selectedPracticeQuestions.size ? `(${selectedPracticeQuestions.size})` : "Selected"} Question{selectedPracticeQuestions.size !== 1 ? "s" : ""}
                </button>
                <button
                  onClick={() => setShowPracticeSelector(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Question List */}
      {!showPracticeSelector && (
        <>
          <h2 className="text-xl font-semibold mb-4">Questions in Quiz ({questions.length})</h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-400">No questions added yet. Add some above!</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="border border-gray-700 bg-gray-900 p-4 rounded hover:border-gray-600 transition"
                >
                  <p className="font-semibold mb-2 text-white">
                    Q{(page - 1) * 50 + idx + 1}: {q.question}
                  </p>

                  <ul className="ml-4 text-gray-300 space-y-1 mb-2">
                    <li>A) {q.option_a}</li>
                    <li>B) {q.option_b}</li>
                    <li>C) {q.option_c}</li>
                    <li>D) {q.option_d}</li>
                  </ul>

                  <p className="text-green-400 mt-2 text-sm">
                    Correct: {q.correct_answer}
                  </p>

                  {q.explanation && (
                    <p className="text-gray-400 text-sm mt-2">Explanation: {q.explanation}</p>
                  )}

                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded border transition ${
                    page === i + 1
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
