-- Restrict quiz answer rows to the authenticated owner of the associated attempt.
-- Apply only after confirming quiz_attempts.user_id stores Supabase auth user IDs.
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quiz_attempt_answers_select_policy ON quiz_attempt_answers;
DROP POLICY IF EXISTS quiz_attempt_answers_insert_policy ON quiz_attempt_answers;
DROP POLICY IF EXISTS quiz_attempt_answers_update_policy ON quiz_attempt_answers;
DROP POLICY IF EXISTS "Students can read their attempt answers" ON quiz_attempt_answers;
DROP POLICY IF EXISTS "Students can insert their attempt answers" ON quiz_attempt_answers;
DROP POLICY IF EXISTS "Students can update their attempt answers" ON quiz_attempt_answers;

CREATE POLICY "Students can read their attempt answers"
ON quiz_attempt_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM quiz_attempts a
    WHERE a.id = quiz_attempt_answers.attempt_id
      AND a.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Students can insert their attempt answers"
ON quiz_attempt_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM quiz_attempts a
    WHERE a.id = quiz_attempt_answers.attempt_id
      AND a.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Students can update their attempt answers"
ON quiz_attempt_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM quiz_attempts a
    WHERE a.id = quiz_attempt_answers.attempt_id
      AND a.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM quiz_attempts a
    WHERE a.id = quiz_attempt_answers.attempt_id
      AND a.user_id = (SELECT auth.uid())
  )
);

-- Service-role server operations bypass RLS; student requests must still use
-- authenticated API routes that verify attempt ownership and submission state.
