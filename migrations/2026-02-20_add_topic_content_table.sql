-- Migration: Add practice_topic_content table for rich content storage
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS practice_topic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL UNIQUE REFERENCES practice_topics(id) ON DELETE CASCADE,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_topic_content_topic ON practice_topic_content(topic_id);
