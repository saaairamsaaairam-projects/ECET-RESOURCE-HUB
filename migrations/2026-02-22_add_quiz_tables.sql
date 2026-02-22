-- Create quiz_sets table
CREATE TABLE IF NOT EXISTS quiz_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  topic_id UUID REFERENCES practice_topics(id) ON DELETE CASCADE,
  subject_folder_id UUID NOT NULL,
  mode VARCHAR(50) DEFAULT 'practice', -- 'practice' or 'exam'
  total_questions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL, -- A, B, C, or D
  explanation TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_sets_subject_folder_id ON quiz_sets(subject_folder_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_topic_id ON quiz_sets(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Enable RLS (Row Level Security) for quiz_sets
ALTER TABLE quiz_sets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reading of quizzes
CREATE POLICY quiz_sets_select_policy ON quiz_sets
  FOR SELECT USING (true);

-- Create policy to allow admins to create/update/delete quizzes
CREATE POLICY quiz_sets_admin_policy ON quiz_sets
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Enable RLS for quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reading of quiz questions
CREATE POLICY quiz_questions_select_policy ON quiz_questions
  FOR SELECT USING (true);

-- Create policy to allow admins to create/update/delete quiz questions
CREATE POLICY quiz_questions_admin_policy ON quiz_questions
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );
