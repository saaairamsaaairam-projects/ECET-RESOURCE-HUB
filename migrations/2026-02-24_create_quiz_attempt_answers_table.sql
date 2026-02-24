-- Migration: Create quiz_attempt_answers table for storing student answers
-- This table records each answer submitted during a quiz attempt

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_number int NOT NULL,
  question_id uuid NOT NULL,
  selected_option varchar(1), -- A, B, C, D or null if unanswered
  is_marked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question_id ON quiz_attempt_answers(question_id);

-- Enable RLS
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read/write access
CREATE POLICY quiz_attempt_answers_select_policy ON quiz_attempt_answers
  FOR SELECT USING (true);

CREATE POLICY quiz_attempt_answers_insert_policy ON quiz_attempt_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY quiz_attempt_answers_update_policy ON quiz_attempt_answers
  FOR UPDATE USING (true);
