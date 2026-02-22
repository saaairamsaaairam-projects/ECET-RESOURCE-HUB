# Practice System Architecture

## Overview

The practice system allows administrators to create practice topics and questions (MCQs) with an integrated UI for students to practice and learn.

## Database Schema

### practice_topics
Stores practice topic categories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| subject | varchar | Subject code: java, dbms, os, python |
| name | varchar | Topic name (e.g., "Variables") |
| slug | varchar | URL-friendly slug (auto-generated) |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Constraints**: `UNIQUE(subject, slug)` - no duplicate topics per subject

### practice_questions
Stores MCQ questions for topics

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| topic_id | UUID | FK to practice_topics |
| question | text | Question text (max 1000 chars) |
| option_a | varchar | Option A (max 500 chars) |
| option_b | varchar | Option B (max 500 chars) |
| option_c | varchar | Option C (max 500 chars) |
| option_d | varchar | Option D (max 500 chars) |
| correct_option | varchar(1) | A, B, C, or D |
| explanation | text | Optional explanation (max 2000 chars) |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Cascade**: Deleting a topic cascades delete to all its questions

---

## API Routes

### Topic CRUD

#### GET /api/practice-topics
Fetch topics for a subject

**Query Parameters**:
- `subject` (required): java, dbms, os, or python
- `slug` (optional): specific topic by slug

**Response**:
```json
[
  {
    "id": "uuid",
    "subject": "java",
    "name": "Variables",
    "slug": "variables",
    "created_at": "2026-02-16T...",
    "updated_at": "2026-02-16T..."
  }
]
```

#### POST /api/practice-topics (🔐 Admin Only)
Create a new topic

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body**:
```json
{
  "subject": "java",
  "name": "Variables"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "subject": "java",
  "name": "Variables",
  "slug": "variables",
  "created_at": "...",
  "updated_at": "..."
}
```

**Validations**:
- ✅ subject in [java, dbms, os, python]
- ✅ name not empty, max 100 chars
- ✅ User must be admin (bearer token validated)
- ✅ Topic slug must be unique per subject

#### PUT /api/practice-topics (🔐 Admin Only)
Update topic

**Body**:
```json
{
  "id": "uuid",
  "name": "new-name"
}
```

**Validations**:
- ✅ id must be valid UUID
- ✅ name length constraints
- ✅ Admin token required

#### DELETE /api/practice-topics (🔐 Admin Only)
Delete topic and all associated questions

**Body**:
```json
{
  "id": "uuid"
}
```

**Notes**:
- Cascade deletes all questions in this topic
- Admin token required

---

### Question CRUD

#### GET /api/practice-questions
Fetch questions (paginated)

**Query Parameters**:
- `topic_id` (optional): UUID of topic
- `page` (optional, default=1): page number
- `per` (optional, default=10): items per page (max 100)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "topic_id": "uuid",
      "question": "What is a variable?",
      "option_a": "Storage location",
      "option_b": "Function call",
      "option_c": "Class definition",
      "option_d": "Method",
      "correct_option": "A",
      "explanation": "A variable is a named storage location...",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "page": 1,
  "per": 10,
  "total": 45
}
```

#### POST /api/practice-questions (🔐 Admin Only)
Create a question

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body**:
```json
{
  "topic_id": "uuid",
  "question": "What is a variable?",
  "option_a": "Storage location",
  "option_b": "Function call",
  "option_c": "Class definition",
  "option_d": "Method",
  "correct_option": "A",
  "explanation": "Optional explanation text"
}
```

**Validations**:
- ✅ topic_id valid UUID and exists
- ✅ question 5-1000 chars
- ✅ Each option 1-500 chars
- ✅ correct_option in [A, B, C, D]
- ✅ explanation optional, max 2000 chars
- ✅ Admin token required

**Response** (201): Full question object

#### PUT /api/practice-questions (🔐 Admin Only)
Update question

**Body**:
```json
{
  "id": "uuid",
  "question": "updated question?",
  "correct_option": "B"
  // Other fields optional
}
```

**Response** (200): Updated question

#### DELETE /api/practice-questions (🔐 Admin Only)
Delete question

**Body**:
```json
{
  "id": "uuid"
}
```

#### PATCH /api/practice-questions/[id] (🔐 Admin Only)
Alternative update endpoint

---

## Admin Authorization

### Flow
1. User sends request with `Authorization: Bearer {token}`
2. Server calls `verifyAdminFromToken(req)`
3. Utility validates token via `supabaseAdmin.auth.getUser(token)`
4. Utility checks `admins` table for user_id match
5. Returns `user_id` if admin, `null` otherwise
6. Route returns 403 if not admin

### Source Code
Location: [utils/serverAuth.ts](utils/serverAuth.ts)

```typescript
export async function verifyAdminFromToken(req: NextRequest): Promise<string | null> {
  // 1. Extract token from Authorization header
  // 2. Get user from token
  // 3. Check admins table
  // 4. Return user_id if found
```

### Error Responses

**403 Forbidden**:
```json
{
  "error": "Forbidden - Admin access required"
}
```

**400 Bad Request**:
```json
{
  "error": "Field validation error message"
}
```

**500 Server Error**:
```json
{
  "error": "Database or processing error"
}
```

---

## Frontend Components

### AddTopicButton (`components/AddTopicButton.tsx`)
Button to create a new topic

**Props**:
- `subject: string` - Subject code (java, dbms, os, python)

**Features**:
- ✅ Prompts for topic name
- ✅ Retrieves auth token from session
- ✅ Sends Bearer token in Authorization header
- ✅ Shows loading state
- ✅ Toast notifications for success/error
- ✅ Reloads page on success

**Usage**:
```tsx
<AddTopicButton subject="java" />
```

### Practice Layout (`app/practice/[subject]/layout.tsx`)
Server component that renders practice sidebar

**Features**:
- ✅ Shows topics for subject in sidebar
- ✅ Numbered topics (01, 02, etc.)
- ✅ Navigation links to topic pages
- ✅ AddTopicButton at bottom
- ✅ Empty state messaging

### Practice Topic Page (`app/practice/[subject]/[topic]/page.tsx`)
Client component for question display and CRUD

**Features**:
- ✅ Lists questions with pagination
- ✅ Question answer reveal toggle
- ✅ Edit question (populates form)
- ✅ Delete question with confirmation
- ✅ Add question form
- ✅ Inline error handling

---

## Input Validation

### Validator Class (`utils/validation.ts`)

Centralized validation logic

**Methods**:
- `requireString(value, field, minLen, maxLen)` - Validate string
- `requireUUID(value, field)` - Validate UUID format
- `requireSubject(value)` - Validate subject code
- `requireOption(value)` - Validate option (A/B/C/D)
- `optionalString(value, field, maxLen)` - Validate optional string
- `getErrors(): ValidationError[]` - Get all errors
- `isValid(): boolean` - Check if validation passed
- `formatError(): string` - Format errors as string

**Example**:
```typescript
const validator = new Validator();
validator.requireString(topicName, "name", 1, 100);
validator.requireSubject(subject);

if (!validator.isValid()) {
  return badRequestResponse(validator.formatError());
}
```

### Sanitization (`utils/validation.ts`)

- `sanitizeString(str)` - Trim and limit to 500 chars
- `sanitizeSubject(str)` - Normalize subject code

---

## Error Handling

### Response Helpers (`utils/serverAuth.ts`)

- `forbiddenResponse()` - Return 403
- `badRequestResponse(message)` - Return 400 with message
- `serverErrorResponse(message)` - Return 500 with message

**Usage**:
```typescript
if (!userId) return forbiddenResponse();
if (!validator.isValid()) return badRequestResponse(validator.formatError());
if (dbError) return serverErrorResponse(error.message);
```

### Console Logging

All endpoints log:
- 📝 Request type and method (POST, PUT, DELETE)
- 🔍 Validation steps
- ✅/❌ Success/failure status
- 📊 Database operations
- ⚠️ Errors with context

Example:
```
📝 POST /api/practice-topics - Creating topic: {subject, topicName, userId}
Generated slug: variables
✅ Topic created successfully: {id}
```

---

## Types & Interfaces (`types/database.ts`)

See [types/database.ts](types/database.ts) for all database entity types:
- `PracticeTopic`
- `PracticeQuestion`
- `CreateTopicRequest`
- `UpdateTopicRequest`
- `DeleteTopicRequest`
- `CreateQuestionRequest`
- `UpdateQuestionRequest`
- `DeleteQuestionRequest`

---

## Subject Values

Valid subjects (hardcoded in validation):
- `java`
- `dbms`
- `os`
- `python`

To add new subjects, update:
1. `utils/validation.ts` - Add to validSubjects array
2. Database - Add new topics with new subject code

---

## Error Codes & Status

| Status | Meaning | When |
|--------|---------|------|
| 201 | Created | Topic/question created successfully |
| 200 | OK | GET/PUT/DELETE successful |
| 400 | Bad Request | Validation error in input |
| 401 | Unauthorized | Invalid password for admin unlock |
| 403 | Forbidden | User is not admin (missing from admins table) |
| 500 | Server Error | Database or processing error |

---

## Best Practices

1. **Always send bearer token** for admin endpoints
2. **Validate on frontend** before sending (UX)
3. **Validate on backend** for security
4. **Handle all error codes** in client code
5. **Use toasts** for user feedback (success/error)
6. **Check console logs** when debugging
7. **Don't store sensitive data** in localStorage
8. **Use type-safe** requests (follow interfaces in types/database.ts)

---

## Example Workflow

### Creating a Complete Topic with Questions

```
1. User logs in → AuthContext checks adminStatus
2. User navigates to /practice/java
3. Sidebar loads from GET /api/practice-topics?subject=java
4. User clicks "+ Add Topic"
5. AddTopicButton prompts for name → sends POST request
6. New topic appears in sidebar
7. User clicks topic → navigates to /practice/java/variables
8. Questions page loads (GET /api/practice-questions?topic_id=X)
9. User fills question form
10. Sends POST /api/practice-questions with Bearer token
11. Question appears in list
12. User clicks reveal → shows correct answer + explanation
13. User can edit/delete via API calls
```

---

## Testing Checklist

- [ ] Create topic as admin
- [ ] Create question for topic
- [ ] View question with reveal toggle
- [ ] Edit question
- [ ] Delete question with confirmation
- [ ] Pagination works (10+ questions)
- [ ] Non-admin cannot create topics (403)
- [ ] Topic name validates (non-empty, max length)
- [ ] All 4 options required
- [ ] Subject validation works
- [ ] Slug generation de-duplicates correctly
