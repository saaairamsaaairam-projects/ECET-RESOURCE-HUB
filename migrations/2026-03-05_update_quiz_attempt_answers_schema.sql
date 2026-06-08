-- Migration: add missing columns to quiz_attempt_answers and remove legacy fields

BEGIN;

-- add user_answer column for freeform responses
ALTER TABLE quiz_attempt_answers
  ADD COLUMN IF NOT EXISTS user_answer text;

-- ensure question_number column exists (some older environments may lack it)
ALTER TABLE quiz_attempt_answers
  ADD COLUMN IF NOT EXISTS question_number int NOT NULL DEFAULT 0;

-- remove legacy "answer" column if it exists
ALTER TABLE quiz_attempt_answers
  DROP COLUMN IF EXISTS answer;

COMMIT;
