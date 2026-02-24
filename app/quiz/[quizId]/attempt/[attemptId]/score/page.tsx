'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  started_at: string;
}

interface QuizMetadata {
  id: string;
  title: string;
  subject_folder_id: string;
}

export default function QuizScorePage({ 
  params 
}: { 
  params: { quizId: string; attemptId: string } 
}) {
  const { quizId, attemptId } = params;
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<QuizMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch attempt details
        const { data: attemptData, error: attemptErr } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();

        if (attemptErr || !attemptData) {
          setError('Attempt not found');
          setLoading(false);
          return;
        }

        // Fetch all answers to calculate total questions
        const { data: answersData, error: answersErr } = await supabase
          .from('quiz_attempt_answers')
          .select('id')
          .eq('attempt_id', attemptId);

        if (!answersErr && answersData) {
          // Create enriched attempt object with calculated fields
          const enrichedAttempt = {
            ...attemptData,
            total_questions: answersData.length,
            correct_answers: attemptData.score || 0,
            wrong_answers: (answersData.length - (attemptData.score || 0))
          };
          setAttempt(enrichedAttempt);
        } else {
          setAttempt(attemptData);
        }

        // Fetch quiz metadata
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id, title, subject_folder_id')
          .eq('id', quizId)
          .single();

        if (quizErr) console.error('Failed to fetch quiz:', quizErr);
        if (quizData) setQuiz(quizData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching score data:', err);
        setError('Failed to load results');
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading results...</div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 text-lg">{error || 'Attempt not found'}</p>
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

  const percentage = Math.round((attempt.correct_answers / attempt.total_questions) * 100);
  const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  
  // Performance feedback
  const getPerformanceFeedback = (percent: number) => {
    if (percent >= 90) return { text: 'Excellent! 🎉', color: 'text-green-400' };
    if (percent >= 75) return { text: 'Great job! 👏', color: 'text-blue-400' };
    if (percent >= 60) return { text: 'Good effort! 📚', color: 'text-yellow-400' };
    if (percent >= 40) return { text: 'Keep practicing! 💪', color: 'text-orange-400' };
    return { text: 'Try again! 🔄', color: 'text-red-400' };
  };

  const feedback = getPerformanceFeedback(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Quiz Completed!
          </h1>
          {quiz && (
            <p className="text-gray-400 text-lg">{quiz.title}</p>
          )}
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-8 mb-8 shadow-2xl">
          {/* Main Score Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
              {attempt.correct_answers}/{attempt.total_questions}
            </div>
            <div className={`text-5xl font-bold mb-4 ${feedback.color}`}>
              {percentage}%
            </div>
            <div className={`text-2xl font-semibold ${feedback.color}`}>
              {feedback.text}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Correct Answers */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-green-500/20">
              <div className="text-gray-400 text-sm mb-1">Correct</div>
              <div className="text-2xl font-bold text-green-400">
                {attempt.correct_answers}
              </div>
            </div>

            {/* Wrong Answers */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-red-500/20">
              <div className="text-gray-400 text-sm mb-1">Wrong</div>
              <div className="text-2xl font-bold text-red-400">
                {attempt.wrong_answers}
              </div>
            </div>

            {/* Time Taken */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-blue-500/20">
              <div className="text-gray-400 text-sm mb-1">Time</div>
              <div className="text-2xl font-bold text-blue-400">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <p className="text-gray-300 text-center">
              You answered{' '}
              <span className="font-bold text-green-400">{attempt.correct_answers}</span>{' '}
              correctly out of{' '}
              <span className="font-bold">{attempt.total_questions}</span> questions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href={`/quiz/${quizId}/attempt/${attemptId}/review`}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            📋 Review Answers
          </Link>
          <Link
            href={`/folder/${quiz?.subject_folder_id || ''}/quiz`}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors duration-200"
          >
            ← Back to Quizzes
          </Link>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gray-800/30 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Tips for Next Time</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            {percentage < 60 && (
              <>
                <li>✓ Review the concepts you got wrong</li>
                <li>✓ Take notes while studying</li>
                <li>✓ Try the quiz again after revision</li>
              </>
            )}
            {percentage >= 60 && percentage < 90 && (
              <>
                <li>✓ Focus on weakly answered topics</li>
                <li>✓ Do similar practice questions</li>
                <li>✓ Aim for 90%+ on retake</li>
              </>
            )}
            {percentage >= 90 && (
              <>
                <li>✓ Excellent performance! Keep it up!</li>
                <li>✓ Help your peers with these topics</li>
                <li>✓ Try advanced level quizzes</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
