-- Migration: safely copy quiz_sets -> quizzes only if quiz_sets exists
-- This version is idempotent and skips work when the legacy table is
-- already gone (avoids 42P01 errors when running again).

BEGIN;

-- only perform copy if the legacy table is present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_sets') THEN
    RAISE NOTICE 'quiz_sets table found, performing migration';

    INSERT INTO quizzes (id, subject_folder_id, title, description, mode, total_questions, duration_minutes, created_at, updated_at)
    SELECT id, subject_folder_id, name, description, mode, total_questions, NULL, created_at, updated_at
    FROM quiz_sets
    WHERE id NOT IN (SELECT id FROM quizzes);

    -- rest of migration logic unchanged -------------------------------------------------
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'quiz_questions' AND column_name = 'practice_question_id'
    ) THEN
      DROP TABLE IF EXISTS tmp_quiz_question_map;
      CREATE TEMP TABLE tmp_quiz_question_map AS
      SELECT
        qq.id AS old_question_id,
        qq.quiz_id AS old_quiz_id,
        gen_random_uuid() AS new_practice_question_id,
        qs.topic_id,
        NULL::text AS question,
        NULL::text AS option_a,
        NULL::text AS option_b,
        NULL::text AS option_c,
        NULL::text AS option_d,
        NULL::text AS correct_answer,
        NULL::text AS explanation,
        now() AS created_at
      FROM quiz_questions qq
      JOIN quiz_sets qs ON qs.id = qq.quiz_id
      WHERE qq.practice_question_id IS NULL;

      IF (SELECT COUNT(*) FROM tmp_quiz_question_map) > 0 THEN
        INSERT INTO practice_questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, created_at)
        SELECT new_practice_question_id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, created_at
        FROM tmp_quiz_question_map;

        UPDATE quiz_questions q
        SET practice_question_id = t.new_practice_question_id
        FROM tmp_quiz_question_map t
        WHERE q.id = t.old_question_id;
      END IF;

    ELSE
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        ALTER TABLE quiz_questions RENAME TO quiz_questions_legacy;
      END IF;

      CREATE TABLE IF NOT EXISTS quiz_questions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
        practice_question_id uuid REFERENCES practice_questions(id) ON DELETE CASCADE,
        order_index int DEFAULT 0,
        created_at timestamptz DEFAULT now()
      );

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
        COALESCE(qq.created_at, now()) AS created_at
      FROM quiz_questions_legacy qq
      JOIN quiz_sets qs ON qs.id = qq.quiz_id;

      INSERT INTO practice_questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, created_at)
      SELECT new_practice_question_id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, created_at
      FROM tmp_quiz_question_map;

      INSERT INTO quiz_questions (id, quiz_id, practice_question_id, order_index, created_at)
      SELECT gen_random_uuid(), old_quiz_id::uuid, new_practice_question_id, 0, created_at
      FROM tmp_quiz_question_map;

    END IF;

    -- update totals
    UPDATE quizzes q
    SET total_questions = sub.count
    FROM (
      SELECT quiz_id, COUNT(*) AS count
      FROM quiz_questions
      GROUP BY quiz_id
    ) AS sub
    WHERE q.id = sub.quiz_id;

  ELSE
    RAISE NOTICE 'quiz_sets table not found; skipping migration';
  END IF;
END$$;

COMMIT;
