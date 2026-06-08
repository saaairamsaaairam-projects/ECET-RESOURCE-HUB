-- Migration: add topic_id column to quizzes and populate from legacy data

BEGIN;

-- add column if missing (nullable for backwards compatibility)
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES practice_topics(id);

-- copy topic_id from quiz_sets if the legacy table still exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_sets') THEN
    UPDATE quizzes q
    SET topic_id = qs.topic_id
    FROM quiz_sets qs
    WHERE qs.id = q.id AND q.topic_id IS NULL;
  END IF;
END$$;

-- add index for queries that look up quizzes by topic
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);

COMMIT;
