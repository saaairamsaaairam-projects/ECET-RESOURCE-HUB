-- Migration: Create quiz review views for score and review pages
-- This provides optimized queries for displaying attempt results

-- View for score calculation and summary
CREATE OR REPLACE VIEW quiz_attempt_summary AS
SELECT
  qa.id as attempt_id,
  qa.quiz_id,
  qa.user_id,
  qa.score,
  qa.total_questions,
  qa.correct_answers,
  qa.wrong_answers,
  qa.started_at,
  qa.completed_at,
  EXTRACT(EPOCH FROM (qa.completed_at - qa.started_at)) as time_taken_seconds,
  ROUND((qa.correct_answers::FLOAT / NULLIF(qa.total_questions, 0) * 100)::NUMERIC, 2) as percentage
FROM quiz_attempts qa;

-- View for detailed review with all question data
CREATE OR REPLACE VIEW quiz_review_full AS
SELECT
  qaa.attempt_id,
  qq.order_index as question_number,
  pq.id as question_id,
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
JOIN quiz_questions qq ON qaa.question_id = qq.practice_question_id
JOIN practice_questions pq ON pq.id = qq.practice_question_id
ORDER BY attempt_id, question_number;
