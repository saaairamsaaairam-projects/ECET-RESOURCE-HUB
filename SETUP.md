# ECET-Resource-Hub Setup Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin (required for /admin-unlock page)
ADMIN_UNLOCK_PASSWORD=your-strong-password-here
```

### 2. Database Setup

Ensure these tables exist in your Supabase database:

#### `auth.users` (automatic with Supabase Auth)
- id: UUID
- email: varchar
- encrypted_password: varchar
- created_at: timestamp

#### `profiles`
```sql
create table profiles (
  id uuid primary key references auth.users(id),
  email varchar not null,
  role varchar default 'user',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

#### `admins`
```sql
create table admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  created_at timestamp default now()
);

-- Add yourself as admin (replace USER_ID)
insert into admins (user_id) values ('USER_ID');
```

#### `folders`
```sql
create table folders (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  parent_id uuid references folders(id),
  thumbnail varchar,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

#### `files`
```sql
create table files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references folders(id),
  name varchar not null,
  storage_path varchar not null,
  url varchar not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

#### `practice_topics`
```sql
create table practice_topics (
  id uuid primary key default gen_random_uuid(),
  subject varchar not null,
  name varchar not null,
  slug varchar not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(subject, slug)
);
```

#### `practice_questions`
```sql
create table practice_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references practice_topics(id) on delete cascade,
  question text not null,
  option_a varchar not null,
  option_b varchar not null,
  option_c varchar not null,
  option_d varchar not null,
  correct_option varchar(1) not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Authentication Flow

### Sign Up
1. Go to `/signup`
2. Enter email and password
3. Account created, profile auto-generated with role='user'

### Login
1. Go to `/login`
2. Enter email and password
3. Redirected to dashboard

### Admin Access
1. Go to `/admin-unlock`
2. Enter `ADMIN_UNLOCK_PASSWORD` from `.env.local`
3. Redirected to admin dashboard

**⚠️ IMPORTANT**: The admin unlock page is temporary/local auth only. For production, implement proper Supabase roles or OAuth.

---

## Practice System Usage

### Create Topic (Admin)
1. Go to `/practice/[subject]` (e.g., `/practice/java`)
2. Click "+ Add Topic" button at bottom of sidebar
3. Enter topic name
4. Must be logged in as admin (verified via bearer token)

### View Topics
Any logged-in user can view topics in the practice sidebar

### Create Questions (Admin)
1. Go to `/practice/[subject]/[topic-slug]`
2. Scroll to "Add Question" form
3. Fill all fields:
   - Question
   - Options A-D
   - Select correct answer
   - (Optional) Explanation
4. Click "Add Question"

### Edit/Delete Questions (Admin)
1. Click pencil icon to edit
2. Click trash icon to delete
3. Must be logged in as admin

---

## API Endpoints

### Topic Management (Admin Required)
- `POST /api/practice-topics` - Create topic
  ```json
  {"subject": "java", "name": "Variables"}
  ```
- `PUT /api/practice-topics` - Update topic
  ```json
  {"id": "uuid", "name": "new-name"}
  ```
- `DELETE /api/practice-topics` - Delete topic

###  Question Management (Admin Required)
- `POST /api/practice-questions` - Create question
- `PUT /api/practice-questions` - Update question  
- `DELETE /api/practice-questions` - Delete question
- `GET /api/practice-questions` - List questions

### Public Endpoints
- `GET /api/practice-topics?subject=java` - Get topics for subject
- `GET /api/practice-questions?topic_id=uuid&page=1&per=10` - Get paginated questions

---

## Security Features

### ✅ Implemented
- **Admin Token Verification**: All admin endpoints verify bearer token
- **Admin Table Check**: Authoritative source for admin status
- **Input Validation**: All inputs validated for type, length, format
- **UUID Validation**: Dynamic route IDs verified
- **SQL Injection Prevention**: Supabase parameterized queries
- **Rate Limiting Ready**: Infrastructure for implementation
- **Async Params Handling**: Next.js 16+ compatibility

### ⚠️ Notes
- Admin password stored in env (one-way unlock, not persistent)
- LocalStorage used for UI-only admin mode (frontend caching)
- No protection on GET endpoints (designed for public practice content)
- Set strong `ADMIN_UNLOCK_PASSWORD` in production

---

## Directory Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── signup/route.ts
│   │   ├── logout/route.ts
│   │   └── verify-admin-password/route.ts
│   ├── practice-topics/route.ts          (CRUD with admin check)
│   ├── practice-questions/route.ts       (CRUD with admin check)
│   └── practice-questions/[id]/route.ts
├── practice/
│   └── [subject]/
│       ├── layout.tsx                     (Server + topics sidebar)
│       ├── page.tsx                       (Topic list)
│       └── [topic]/
│           └── page.tsx                   (Questions + inline CRUD)
└── admin/
    ├── practice-topics/page.tsx           (Legacy - admin CRUD)
    └── practice-questions/page.tsx        (Legacy - admin CRUD)

components/
├── AddTopicButton.tsx                     (Creates topics with auth token)
└── ...

types/
└── database.ts                            (TypeScript interfaces)

utils/
├── serverAuth.ts                          (Admin verification utility)
├── validation.ts                          (Input validation)
├── supabase.ts                            (Client instance)
└── ...

context/
├── AuthContext.tsx                        (Auth state + admin check)
└── ...
```

---

## Testing Practice System

### Create Test Data

```bash
# 1. Sign up and get added to admins table
# 2. Go to /practice/java
# 3. Click "+ Add Topic"
# 4. Enter "Variables"
# 5. Navigate to that topic
# 6. Create a question with 4 options
# 7. Test reveal functionality
# 8. Test edit/delete
```

### Common Issues

**Topic creation fails with "Forbidden"**
- Ensure user is in `admins` table
- Check bearer token is sent correctly
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**Changes not appearing**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify Supabase connection

**API returns 400 - validation error**
- Check console error message
- Ensure all required fields present
- Verify field formats: UUID, subject from [java,dbms,os,python]

---

## Next Steps

### High Priority
- [ ] Implement rate limiting on auth endpoints
- [ ] Add password reset flow
- [ ] Implement proper Supabase RLS policies
- [ ] Add email verification on signup

### Medium Priority
- [ ] Add question categories/tags
- [ ] Implement difficulty levels
- [ ] Add user analytics/progress tracking
- [ ] Create admin dashboard with stats

### Low Priority
- [ ] Add question images/attachments
- [ ] Implement question versioning
- [ ] Add community features (likes, comments)
- [ ] Build mobile app

---

## Support

For issues or questions, check:
1. Console errors (browser DevTools)
2. Server logs (terminal output)
3. Supabase dashboard for DB issues
4. `.env.local` environment variables set correctly
