-- Migration: create quizzes, quiz_questions (mapping), and quiz_attempts
-- Run this in Supabase SQL editor or via your migration runner

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  mode text NOT NULL DEFAULT 'topic', -- 'topic', 'mixed', 'full'
  difficulty text DEFAULT 'medium',
  total_questions int DEFAULT 0,
  duration_minutes int DEFAULT 60,
  attempts_allowed int DEFAULT 1,
  show_review boolean DEFAULT false,
  show_score boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  practice_question_id uuid REFERENCES practice_questions(id) ON DELETE CASCADE,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score int,
  total_questions int,
  correct_answers int,
  wrong_answers int,
  time_taken int,
  status text DEFAULT 'submitted',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_folder_id ON quizzes(subject_folder_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
