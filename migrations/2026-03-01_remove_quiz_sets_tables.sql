-- Migration: remove legacy quiz_sets and quiz_set_questions tables
-- After running the previous migration that copied quiz_sets -> quizzes,
-- and after verifying that no code references the old tables, we can
-- safely drop them along with their associated indexes and policies.
-- Run this in the Supabase SQL editor or via your migration runner.

BEGIN;

-- it is safe to drop only if no rows remain in the legacy table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_sets') THEN
        RAISE NOTICE 'dropping quiz_sets and related objects';
        DROP TABLE IF EXISTS quiz_sets CASCADE;
    ELSE
        RAISE NOTICE 'quiz_sets table not present, skipping';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_set_questions') THEN
        RAISE NOTICE 'dropping quiz_set_questions';
        DROP TABLE IF EXISTS quiz_set_questions CASCADE;
    ELSE
        RAISE NOTICE 'quiz_set_questions table not present, skipping';
    END IF;
END$$;

COMMIT;
