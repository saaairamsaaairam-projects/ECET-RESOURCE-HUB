-- Migration: Create standalone_topics table for independent topic management
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS standalone_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_standalone_topics_slug ON standalone_topics(slug);

-- Create index for published topics
CREATE INDEX IF NOT EXISTS idx_standalone_topics_published ON standalone_topics(published);

-- Create standalone_topic_content table for rich content storage
CREATE TABLE IF NOT EXISTS standalone_topic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL UNIQUE REFERENCES standalone_topics(id) ON DELETE CASCADE,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for topic content lookups
CREATE INDEX IF NOT EXISTS idx_standalone_topic_content_topic ON standalone_topic_content(topic_id);

-- Enable RLS (Row Level Security)
ALTER TABLE standalone_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_topic_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for standalone_topics
-- Allow all users to read published topics
CREATE POLICY "Allow public read published topics" ON standalone_topics
  FOR SELECT USING (published = true);

-- Allow admins to do all operations on topics
CREATE POLICY "Allow admins full access to topics" ON standalone_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for standalone_topic_content
-- Allow all users to read content of published topics
CREATE POLICY "Allow public read published topic content" ON standalone_topic_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM standalone_topics
      WHERE standalone_topics.id = standalone_topic_content.topic_id
      AND standalone_topics.published = true
    )
  );

-- Allow admins to do all operations on topic content
CREATE POLICY "Allow admins full access to topic content" ON standalone_topic_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for standalone_topics
CREATE TRIGGER update_standalone_topics_updated_at
  BEFORE UPDATE ON standalone_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for standalone_topic_content
CREATE TRIGGER update_standalone_topic_content_updated_at
  BEFORE UPDATE ON standalone_topic_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();