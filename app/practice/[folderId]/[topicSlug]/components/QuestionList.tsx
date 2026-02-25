"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import QuestionCard from "@/components/practice/QuestionCard";
import AddMCQButton from "./AddMCQButton";

const QUESTIONS_PER_PAGE = 10;

export default function QuestionList({
  topicId,
  topicName,
  topicSlug,
  folderId,
  initialQuestions,
  isAdmin,
}: {
  topicId: string;
  topicName: string;
  topicSlug: string;
  folderId: string;
  initialQuestions: any[];
  isAdmin?: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { isAdmin: authIsAdmin } = useAuth();
  const showAdmin = typeof isAdmin === "boolean" ? isAdmin : authIsAdmin;

  useEffect(() => {
    try {
       
      console.log(
        `QuestionList: topicId=${topicId} initialQuestions=${(initialQuestions || []).length}`,
        initialQuestions && initialQuestions[0]
      );
    } catch (e) {
      // ignore
    }
  }, [topicId, initialQuestions]);

  // Filter questions based on search
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;

    const query = searchQuery.toLowerCase();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.option_a.toLowerCase().includes(query) ||
        q.option_b.toLowerCase().includes(query) ||
        q.option_c.toLowerCase().includes(query) ||
        q.option_d.toLowerCase().includes(query) ||
        (q.explanation && q.explanation.toLowerCase().includes(query))
    );
  }, [questions, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIdx = startIdx + QUESTIONS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIdx, endIdx);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle reload after add/edit/delete
  const handleReload = async () => {
    // Optionally refetch from server
    // For now, just refresh
    window.location.reload();
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{topicName}</h1>
        <p className="text-gray-400">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} ·
          Practice and master this topic
        </p>
      </div>

      {/* Add MCQ Button (Admin Only) */}
      {showAdmin && (
        <AddMCQButton 
          topicId={topicId} 
          topicSlug={topicSlug} 
          folderId={folderId}
          onReload={handleReload}
        />
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search questions, options, or explanations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 p-4 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-400 mt-2">
            Found {filteredQuestions.length} matching question
            {filteredQuestions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* No Results */}
      {filteredQuestions.length === 0 && searchQuery && (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-lg">No questions match your search</p>
          <p className="text-gray-500 mt-2">Try different keywords</p>
          <button
            onClick={() => handleSearch("")}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* No Questions */}
      {questions.length === 0 && !searchQuery && (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-lg">No questions yet</p>
          {showAdmin && (
            <p className="text-gray-500 mt-2">Click "Add Question" to get started</p>
          )}
        </div>
      )}

      {/* Questions List */}
      {filteredQuestions.length > 0 && (
        <>
          <div className="space-y-6 mb-8">
            {paginatedQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={startIdx + idx + 1}
                isAdmin={showAdmin}
                topicId={topicId}
                folderId={folderId}
                topicSlug={topicSlug}
                onReload={handleReload}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-8 border-t border-gray-700">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
