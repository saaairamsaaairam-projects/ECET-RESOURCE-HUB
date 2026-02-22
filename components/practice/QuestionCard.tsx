"use client";

import { useState } from "react";
import EditMCQButton from "@/components/practice/EditMCQButton";
import DeleteMCQButton from "@/components/practice/DeleteMCQButton";

export default function QuestionCard({
  question,
  index,
  isAdmin,
  topicId,
  folderId,
  topicSlug,
  onReload,
}: {
  question: any;
  index: number;
  isAdmin: boolean;
  topicId: string;
  folderId: string;
  topicSlug: string;
  onReload?: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  const options = [
    { label: "A", text: question.option_a },
    { label: "B", text: question.option_b },
    { label: "C", text: question.option_c },
    { label: "D", text: question.option_d },
  ];

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white flex-1">
          <span className="text-purple-400">{index}.</span> {question.question}
        </h3>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2 ml-4">
            <EditMCQButton
              question={question}
              topicId={topicId}
              folderId={folderId}
              topicSlug={topicSlug}
              onReload={onReload}
            />
            <DeleteMCQButton
              questionId={question.id}
              topicId={topicId}
              folderId={folderId}
              topicSlug={topicSlug}
              onReload={onReload}
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <div
            key={opt.label}
            className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <span className="min-w-fit px-2 py-1 bg-gray-700 text-gray-300 rounded font-semibold text-sm">
              {opt.label}
            </span>
            <span className="text-gray-300 py-1">{opt.text}</span>
          </div>
        ))}
      </div>

      {/* Show Answer Button */}
      {!showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Show Answer
        </button>
      )}

      {/* Answer Box */}
      {showAnswer && (
        <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
          {/* Correct Answer */}
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-1">✓ Correct Answer</p>
            <p className="text-white text-lg font-bold">
              Option {question.correct_option}
            </p>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-400 font-semibold mb-2">💡 Explanation</p>
              <p className="text-gray-300 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* Hide Answer Button */}
          <button
            onClick={() => setShowAnswer(false)}
            className="mt-4 px-4 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
          >
            Hide Answer
          </button>
        </div>
      )}
    </div>
  );
}
