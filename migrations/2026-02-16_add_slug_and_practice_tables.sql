-- Migration: Add slug to folders and create practice tables
-- Run this in Supabase SQL editor or with psql

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Add slug column to folders (unique)
ALTER TABLE IF EXISTS folders
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2) Create practice_topics
CREATE TABLE IF NOT EXISTS practice_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT practice_topics_subject_slug_unique UNIQUE (subject_folder_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_practice_topics_subject ON practice_topics(subject_folder_id);

-- 3) Create practice_questions
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES practice_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT practice_questions_correct_option_check CHECK (correct_option IN ('A','B','C','D'))
);

CREATE INDEX IF NOT EXISTS idx_practice_questions_topic ON practice_questions(topic_id);

-- Optional: keep a lightweight topic summary view
CREATE MATERIALIZED VIEW IF NOT EXISTS practice_topic_counts AS
SELECT t.id AS topic_id, t.subject_folder_id, t.name, t.slug, COUNT(q.id) AS question_count
FROM practice_topics t
LEFT JOIN practice_questions q ON q.topic_id = t.id
GROUP BY t.id;

-- Note: After running this migration, populate `folders.slug` for existing subject root folders.
-- Example:
-- UPDATE folders SET slug = LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- End of migration
