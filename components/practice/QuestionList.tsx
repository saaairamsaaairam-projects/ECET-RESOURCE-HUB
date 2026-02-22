"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AddQuestionModal from "./AddQuestionModal";
import BulkUploadModal from "./BulkUploadModal";
import EditMCQModal from "./EditMCQModal";
import DeleteMCQButton from "./DeleteMCQButton";

export default function QuestionList({ topicId, folderId, topicSlug }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<any>(null);
  const { isAdmin } = useAuth();

  async function loadQuestions() {
    if (!topicId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/practice-questions?topic_id=${encodeURIComponent(topicId)}&page=${page}`);
      const json = await res.json();

      // Support both shapes (old: data, new: questions)
      setQuestions(json.questions || json.data || []);
      setTotalPages(json.totalPages || Math.max(1, Math.ceil((json.total || 0) / (json.pageSize || 50))));
    } catch (err) {
      console.error("Failed to fetch questions", err);
      setQuestions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, page]);

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="mb-4 flex gap-4">
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-purple-600 text-white rounded">+ Add Question</button>
          <button onClick={() => setBulkOpen(true)} className="px-4 py-2 bg-purple-600/80 text-white rounded">Bulk Upload MCQs</button>

          <button
            onClick={() => (window.location.href = "/api/practice/bulk-template")}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            Download Template
          </button>
        </div>
      )}

      <AddQuestionModal open={open} onClose={() => setOpen(false)} topicSlug={topicSlug} folderId={folderId} />
      {isAdmin && bulkOpen && (
        <BulkUploadModal
          topicId={topicId}
          onClose={() => setBulkOpen(false)}
          onUploaded={() => loadQuestions()}
        />
      )}

      {questions.map((q: any, i: number) => (
        <div key={q.id} className="border p-4 rounded bg-[#111] text-white">
          <p className="font-semibold mb-2">Question {(page - 1) * 50 + i + 1}: {q.question}</p>

          <div className="space-y-1">
            {["a","b","c","d"].map((letter) => (
              <div key={letter} className={`p-2 rounded ${showAnswer[q.id] && q.correct_option === letter.toUpperCase() ? "bg-green-700" : "bg-gray-800"}`}>
                <strong>{letter.toUpperCase()}:</strong> {q[`option_${letter}`]}
              </div>
            ))}
          </div>

          <button className="mt-2 text-blue-400 underline" onClick={() => setShowAnswer((p: any) => ({ ...p, [q.id]: !p[q.id] }))}>
            {showAnswer[q.id] ? "Hide Answer" : "Show Answer"}
          </button>

          {showAnswer[q.id] && q.explanation && <p className="mt-2 text-gray-300">{q.explanation}</p>}

          {isAdmin && (
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => setEditing(q)}
                className="text-blue-400 hover:underline"
              >
                Edit
              </button>

              <DeleteMCQButton
                questionId={q.id}
                topicId={topicId}
                folderId={folderId}
                topicSlug={topicSlug}
                onReload={() => loadQuestions()}
              />
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 mb-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                page === i + 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {editing && (
        <EditMCQModal
          open={!!editing}
          setOpen={(v: boolean) => { if (!v) setEditing(null); }}
          question={editing}
          topicId={topicId}
          folderId={folderId}
          topicSlug={topicSlug}
          onReload={() => loadQuestions()}
        />
      )}
    </div>
  );
}
