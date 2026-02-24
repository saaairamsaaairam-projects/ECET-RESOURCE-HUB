-- Migration: Create quiz review views for score and review pages
-- PREREQUISITE: Run 2026-02-24_create_quiz_attempt_answers_table.sql FIRST
-- NOTE: Uses only columns that exist in actual database schema

-- View for score calculation and summary
CREATE OR REPLACE VIEW quiz_attempt_summary AS
SELECT
  qa.id as attempt_id,
  qa.quiz_id,
  qa.user_id,
  qa.score,
  COUNT(qaa.id) as total_questions,
  qa.score as correct_answers,
  COALESCE(COUNT(qaa.id) - qa.score, 0) as wrong_answers,
  qa.started_at,
  EXTRACT(EPOCH FROM (NOW() - qa.started_at)) as time_taken_seconds,
  ROUND((qa.score::FLOAT / NULLIF(COUNT(qaa.id), 0) * 100)::NUMERIC, 2) as percentage
FROM quiz_attempts qa
LEFT JOIN quiz_attempt_answers qaa ON qa.id = qaa.attempt_id
GROUP BY qa.id, qa.quiz_id, qa.user_id, qa.score, qa.started_at;

-- View for detailed review with all question data
CREATE OR REPLACE VIEW quiz_review_full AS
SELECT
  qaa.attempt_id,
  qaa.question_number,
  qaa.question_id,
  pq.question,
  pq.option_a,
  pq.option_b,
  pq.option_c,
  pq.option_d,
  pq.correct_option as correct_answer,
  pq.explanation,
  qaa.selected_option as given_answer,
  CASE 
    WHEN qaa.selected_option = pq.correct_option THEN true
    ELSE false
  END as is_correct
FROM quiz_attempt_answers qaa
LEFT JOIN practice_questions pq ON qaa.question_id = pq.id
ORDER BY attempt_id, question_number;
