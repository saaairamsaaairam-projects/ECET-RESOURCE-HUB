# URGENT FIX: Quizzes Not Showing for Students

## Problem
- ✅ Admin accounts can see quizzes
- ❌ Student accounts see "No quizzes available"
- **Root Cause:** RLS (Row Level Security) policies are not allowing students to READ the quizzes table

---

## 🔧 Quick Fix - Run This SQL in Supabase

Go to **Supabase Dashboard → SQL Editor** and run this:

```sql
-- Enable RLS on quizzes table
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read quizzes
CREATE POLICY "Allow public read access to quizzes" ON quizzes
  FOR SELECT
  USING (true);

-- Allow admins to create/update/delete quizzes
DROP POLICY IF EXISTS "Allow admins to manage quizzes" ON quizzes;
CREATE POLICY "Allow admins to manage quizzes" ON quizzes
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- Enable RLS on quiz_questions table if not already
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quiz_questions" ON quiz_questions
  FOR SELECT
  USING (true);

-- Enable RLS on quiz_attempts if not already  
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow users to see/create/update their own attempts
CREATE POLICY "Allow users to see their own attempts" ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow users to create attempts" ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow users to update their own attempts" ON quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

---

## ✅ Test After Running SQL

1. **Logout** from admin account
2. **Login** as student account
3. **Navigate** to any subject folder → Click "Quizzes"
4. **Should see** all quizzes created by admin ✓

---

## 🔍 Verify Policies Were Created

Run this query to check:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY tablename, policyname;
```

Should show policies for all three tables with public read access.

---

## 📝 What This Does

| Table | Policy | Who Can Do It |
|-------|--------|--------------|
| `quizzes` | SELECT | Everyone ✓ |
| `quizzes` | INSERT/UPDATE/DELETE | Admins only |
| `quiz_questions` | SELECT | Everyone ✓ |
| `quiz_attempts` | SELECT | Only own attempts |
| `quiz_attempts` | INSERT/UPDATE | Own attempts or guest |

---

## 🚀 After This Works

- Students can browse and start quizzes
- Students can take fullscreen exams
- Students can view scores and reviews
- Everything ends-to-end should work!

**Done!** The quizzes will now be visible to all accounts. 👍
