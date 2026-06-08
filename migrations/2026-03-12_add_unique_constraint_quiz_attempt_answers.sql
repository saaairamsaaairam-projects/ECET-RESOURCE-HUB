-- Migration: Add unique constraint to quiz_attempt_answers table
-- This constraint enables safe upserts on (attempt_id, question_id) pairs

-- Add unique constraint if it doesn't exist
ALTER TABLE quiz_attempt_answers ADD CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id);

-- Update the trigger to handle the updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_attempt_answers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if it exists
DROP TRIGGER IF EXISTS update_quiz_attempt_answers_timestamp ON quiz_attempt_answers;

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_attempt_answers_timestamp
BEFORE UPDATE ON quiz_attempt_answers
FOR EACH ROW
EXECUTE FUNCTION update_quiz_attempt_answers_timestamp();
