'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

interface ReviewQuestion {
  attempt_id: string;
  question_number: number;
  question_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  given_answer: string | null;
  is_correct: boolean;
}

interface QuizMetadata {
  id: string;
  title: string;
  subject_folder_id: string;
}

interface AttemptMetadata {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
}

const optionLetters = ['A', 'B', 'C', 'D'];
const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'];

export default function ReviewPage({
  params,
}: {
  params: { quizId: string; attemptId: string };
}) {
  const { quizId, attemptId } = params;
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [quiz, setQuiz] = useState<QuizMetadata | null>(null);
  const [attempt, setAttempt] = useState<AttemptMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'wrong'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch attempt metadata
        const { data: attemptData, error: attemptErr } = await supabase
          .from('quiz_attempts')
          .select('id, score, total_questions, correct_answers')
          .eq('id', attemptId)
          .single();

        if (attemptErr || !attemptData) {
          setError('Attempt not found');
          setLoading(false);
          return;
        }

        setAttempt(attemptData);

        // Fetch quiz metadata
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, subject_folder_id')
          .eq('id', quizId)
          .single();

        if (quizErr) console.error('Failed to fetch quiz:', quizErr);
        if (quizData) setQuiz(quizData);

        // Fetch review data
        const { data: reviewData, error: reviewErr } = await supabase
          .from('quiz_review_full')
          .select('*')
          .eq('attempt_id', attemptId)
          .order('question_number', { ascending: true });

        if (reviewErr) {
          console.error('Failed to fetch review data:', reviewErr);
          setError('Failed to load review data');
          setLoading(false);
          return;
        }

        if (reviewData && reviewData.length > 0) {
          setQuestions(reviewData);
        } else {
          setError('No questions found for this attempt');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to load review page');
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading review...</div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 text-lg">{error || 'No questions found'}</p>
          <Link
            href={`/folder/${quiz?.subject_folder_id || ''}/quiz`}
            className="mt-6 inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const filteredQuestions =
    filterMode === 'all'
      ? questions
      : filterMode === 'correct'
      ? questions.filter((q) => q.is_correct)
      : questions.filter((q) => !q.is_correct);

  const currentQuestion = filteredQuestions[selectedQuestion] || questions[0];
  const correctCount = questions.filter((q) => q.is_correct).length;
  const wrongCount = questions.length - correctCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Review Answers
              </h1>
              {quiz && (
                <p className="text-gray-400 text-lg mt-2">{quiz.title}</p>
              )}
            </div>
            <Link
              href={`/folder/${quiz?.subject_folder_id || ''}/quiz`}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
            >
              ← Back
            </Link>
          </div>

          {/* Stats Bar */}
          {attempt && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Total Questions</div>
                <div className="text-2xl font-bold text-purple-400">{attempt.total_questions}</div>
              </div>
              <div className="bg-gray-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Correct</div>
                <div className="text-2xl font-bold text-green-400">{attempt.correct_answers}</div>
              </div>
              <div className="bg-gray-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Wrong</div>
                <div className="text-2xl font-bold text-red-400">
                  {attempt.total_questions - attempt.correct_answers}
                </div>
              </div>
              <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Percentage</div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            {/* Filter Buttons */}
            <div className="mb-4 grid grid-cols-3 lg:grid-cols-1 gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterMode === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterMode === 'correct'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ✓ Correct
              </button>
              <button
                onClick={() => setFilterMode('wrong')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterMode === 'wrong'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ✗ Wrong
              </button>
            </div>

            {/* Question List */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sticky top-4">
              <div className="text-gray-400 text-sm font-semibold mb-3">
                Questions ({filteredQuestions.length})
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredQuestions.map((q, idx) => (
                  <button
                    key={`${q.question_id}-${idx}`}
                    onClick={() => setSelectedQuestion(idx)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedQuestion === idx
                        ? 'bg-purple-600 text-white'
                        : q.is_correct
                        ? 'bg-green-900/40 hover:bg-green-900/60 text-green-300 border border-green-600/50'
                        : 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-600/50'
                    }`}
                  >
                    <div className="font-semibold">Q{q.question_number}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {q.is_correct ? '✓ Correct' : '✗ Wrong'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Detail View */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Question {currentQuestion.question_number}
                      </h2>
                      <p className="text-gray-300 text-lg">{currentQuestion.question}</p>
                    </div>
                    <div
                      className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        currentQuestion.is_correct
                          ? 'bg-green-900/40 text-green-400 border border-green-600'
                          : 'bg-red-900/40 text-red-400 border border-red-600'
                      }`}
                    >
                      {currentQuestion.is_correct ? '✓ Correct' : '✗ Wrong'}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="mb-6 space-y-3">
                  <div className="text-gray-400 text-sm font-semibold mb-3">Options:</div>
                  {optionKeys.map((key, idx) => {
                    const optionValue = (currentQuestion as Record<string, any>)[key];
                    const letter = optionLetters[idx];
                    const isCorrect = letter === currentQuestion.correct_answer;
                    const isSelected = letter === currentQuestion.given_answer;

                    let borderColor = 'border-gray-600';
                    let bgColor = 'bg-gray-700/50';
                    let textColor = 'text-gray-300';

                    if (isCorrect) {
                      borderColor = 'border-green-500';
                      bgColor = 'bg-green-900/40';
                      textColor = 'text-green-300';
                    } else if (isSelected && !isCorrect) {
                      borderColor = 'border-red-500';
                      bgColor = 'bg-red-900/40';
                      textColor = 'text-red-300';
                    }

                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${textColor}`}
                      >
                        <div className="flex items-start">
                          <div className="font-bold mr-3 text-lg">{letter}.</div>
                          <div className="flex-1">
                            <p className="text-base">{optionValue}</p>
                            <div className="mt-2 flex gap-2">
                              {isCorrect && (
                                <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">
                                  Correct Answer
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="text-xs bg-red-600 px-2 py-1 rounded text-white">
                                  Your Answer
                                </span>
                              )}
                              {isSelected && isCorrect && (
                                <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">
                                  Your Answer ✓
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <div className="bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4">
                    <h3 className="text-blue-300 font-semibold mb-2">💡 Explanation</h3>
                    <p className="text-gray-200 text-base leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex gap-4 justify-between">
                  <button
                    onClick={() =>
                      setSelectedQuestion(Math.max(0, selectedQuestion - 1))
                    }
                    disabled={selectedQuestion === 0}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>
                      Question {selectedQuestion + 1} of {filteredQuestions.length}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedQuestion(
                        Math.min(filteredQuestions.length - 1, selectedQuestion + 1)
                      )
                    }
                    disabled={selectedQuestion === filteredQuestions.length - 1}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">Performance Rating</h3>
            <p className="text-2xl font-bold text-purple-400">
              {(attempt?.score || 0) >= attempt?.total_questions! * 0.9
                ? '⭐ Excellent'
                : (attempt?.score || 0) >= attempt?.total_questions! * 0.75
                ? '✅ Good'
                : (attempt?.score || 0) >= attempt?.total_questions! * 0.5
                ? '📚 Average'
                : '🔄 Needs Work'}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">Correct Answers</h3>
            <p className="text-2xl font-bold text-green-400">{correctCount} questions</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(((correctCount / questions.length) * 100))}% accuracy
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">To Improve</h3>
            <p className="text-2xl font-bold text-orange-400">{wrongCount} questions</p>
            <p className="text-xs text-gray-500 mt-1">Review these concepts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Link
            href={`/folder/${quiz?.subject_folder_id || ''}/quiz`}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
          >
            Back to Quizzes
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
          >
            🖨️ Print Review
          </button>
        </div>
      </div>
    </div>
  );
}
