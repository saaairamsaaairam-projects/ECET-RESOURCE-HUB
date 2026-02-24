-- Migration: Enable RLS policies on quiz tables for public access
-- This allows students to see and attempt quizzes

-- Enable RLS on quizzes table
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all quizzes
CREATE POLICY "Allow public read access to quizzes" ON quizzes
  FOR SELECT
  USING (true);

-- Policy: Allow admins to create/update/delete quizzes
CREATE POLICY "Allow admins to manage quizzes" ON quizzes
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- Enable RLS on quiz_questions table
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to quiz questions
CREATE POLICY "Allow public read access to quiz_questions" ON quiz_questions
  FOR SELECT
  USING (true);

-- Policy: Allow admins to manage quiz_questions
CREATE POLICY "Allow admins to manage quiz_questions" ON quiz_questions
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- Enable RLS on quiz_attempts table
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to see their own attempts
CREATE POLICY "Allow users to see their own attempts" ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT user_id FROM admins));

-- Policy: Allow users to create their own attempts
CREATE POLICY "Allow users to create attempts" ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT user_id FROM admins));

-- Policy: Allow users to update their own attempts
CREATE POLICY "Allow users to update their own attempts" ON quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT user_id FROM admins));
