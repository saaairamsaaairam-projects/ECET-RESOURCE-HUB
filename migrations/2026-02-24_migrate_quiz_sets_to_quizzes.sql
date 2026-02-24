-- Migration: migrate quiz_sets -> quizzes and convert quiz_sets.quiz_questions -> practice_questions + quiz_questions mapping
-- Run this in Supabase SQL editor. Review before running in production.

BEGIN;

-- 1) Copy quiz_sets rows into quizzes (preserve id)
INSERT INTO quizzes (id, subject_folder_id, title, description, mode, total_questions, duration_minutes, created_at, updated_at)
SELECT id, subject_folder_id, name, description, mode, total_questions, NULL, created_at, updated_at
FROM quiz_sets
WHERE id NOT IN (SELECT id FROM quizzes);

-- 2) Build a temporary mapping of old quiz_questions -> new practice_question ids
DROP TABLE IF EXISTS tmp_quiz_question_map;
CREATE TEMP TABLE tmp_quiz_question_map AS
SELECT
  qq.id AS old_question_id,
  qq.quiz_id AS old_quiz_id,
  gen_random_uuid() AS new_practice_question_id,
  qs.topic_id,
  qq.question,
  qq.option_a,
  qq.option_b,
  qq.option_c,
  qq.option_d,
  qq.correct_answer,
  qq.explanation,
  qq.created_at
FROM quiz_questions qq
JOIN quiz_sets qs ON qs.id = qq.quiz_id;

-- 3) Insert the practice_questions using the generated ids (preserve created_at)
INSERT INTO practice_questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, created_at)
SELECT
  new_practice_question_id,
  topic_id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  COALESCE(created_at, now())
FROM tmp_quiz_question_map;

-- 4) Insert mappings into the new quiz_questions table (which maps quizzes -> practice_questions)
-- Use gen_random_uuid() for mapping id and default order_index to 0
INSERT INTO quiz_questions (id, quiz_id, practice_question_id, order_index, created_at)
SELECT
  gen_random_uuid(),
  old_quiz_id::uuid,
  new_practice_question_id,
  0,
  COALESCE(created_at, now())
FROM tmp_quiz_question_map;

-- 5) Optional: update quizzes.total_questions to match migrated questions
UPDATE quizzes q
SET total_questions = sub.count
FROM (
  SELECT quiz_id, COUNT(*) AS count
  FROM tmp_quiz_question_map
  GROUP BY quiz_id
) AS sub
WHERE q.id = sub.quiz_id;

COMMIT;

-- Cleanup: TEMP table will be dropped automatically at session end.

-- Notes:
-- - This migration assumes quiz_sets.id values can be reused as quizzes.id. If you prefer new ids, adjust accordingly.
-- - The migration creates new practice_questions linked to the original quiz_sets.topic_id.
-- - Review the generated practice_questions and mappings before deleting the old quiz_sets/quiz_questions.
-- - If you have custom fields not covered here, adapt queries accordingly.
