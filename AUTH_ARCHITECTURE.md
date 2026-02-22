# Server-Only Authentication Architecture

## Overview
This application now uses **pure server-side authentication** with cookies and database. NO client-side storage (localStorage/sessionStorage).

## Authentication Flow

### 1. Login/Signup (`/api/auth/login` and `/api/auth/signup`)
```
User submits credentials
    ↓
Server-side Supabase (`createServerClient`) processes auth
    ↓
Session cookies are automatically set by Supabase
    ↓
Response sent to client
    ↓
Browser stores cookies automatically (secure, httpOnly)
```

**Key Point**: Cookies are set via HTTP headers by the server, not by client-side code. The browser automatically manages them.

### 2. Client Queries Session (`/api/auth/me`)
```
Client component mounts
    ↓
useAuth() calls GET /api/auth/me
    ↓
Browser automatically sends cookies with request
    ↓
Server reads cookies via createServerClient
    ↓
Server queries admins table for user role
    ↓
Returns { user, role, isAdmin }
    ↓
Client component renders based on role
```

### 3. Server-Side Authorization (Pages)
```
User navigates to /folder/[id]/practice/manage
    ↓
Server component calls await getUserRole()
    ↓
Server reads session cookies
    ↓
Server checks admins table
    ↓
If not admin: NextResponse.redirect('/') happens AT THE SERVER
    ↓
If admin: Page renders
```

## File Changes

### New Files
- **`/app/api/auth/me/route.ts`** - Returns current user from cookies + database

### Modified Files
1. **`/context/AuthContext.tsx`**
   - ❌ Removed: Client-side Supabase (`import { supabase }`)
   - ❌ Removed: `supabase.auth.onAuthStateChange()` listener
   - ❌ Removed: Client-side admins table check
   - ✅ Added: `fetch("/api/auth/me")` call
   - ✅ Result: User data comes from server endpoint only

2. **`/context/AdminContext.tsx`**
   - ❌ Removed: All localStorage usage
   - ❌ Removed: `localStorage.getItem("adminMode")`
   - ❌ Removed: `localStorage.setItem("adminMode", ...)`
   - ✅ Result: No persistent client-side state

3. **`/app/api/auth/login/route.ts`** (Fixed in previous session)
   - Uses `createServerClient` with cookie handlers
   - Supabase sets cookies automatically
   - Added logging: "✅ Login successful, session cookies set"

4. **`/app/api/auth/signup/route.ts`** (Fixed in previous session)
   - Same pattern as login

### Already Correct
- **`/utils/getUserRole.ts`** - Server utility using `createServerClient`
- **`/app/folder/[id]/practice/manage/page.tsx`** - Server-side auth checks
- All other pages that use server-side auth verification

## Key Principles

### 1. Cookies are Sacred 🔐
- Set by: Server response headers (login/signup endpoints)
- Read by: Server (createServerClient) and automatically sent by browser
- Managed by: Browser (secure, httpOnly cannot be accessed by JavaScript)
- Stored by: Browser (persists across page refreshes)

### 2. Client-Side is Read-Only 📖
- AuthContext: Reads user info from `/api/auth/me` endpoint
- No direct database access from client
- No localStorage, sessionStorage, or cache
- No client-side validation for authorization (advisory UI only)

### 3. Server-Side is Authoritative ✅
- Actual auth checks happen in:
  - `/api/auth/login` and `/api/auth/signup` (sets cookies)
  - Server pages via `await getUserRole()`
  - Redirects happen BEFORE page renders (not client-side)
- Database is source of truth:
  - `auth.users` table (Supabase managed)
  - `admins` table (we manage for role check)

## Troubleshooting

### "NO USER" Error
If you see `🔍 SERVER USER: NO USER` in logs:
1. Cookies not being set by login endpoint → session lost
2. Solution: Clear `.next/`, restart server, log in again
3. Verify: Check browser DevTools → Application → Cookies for session cookie

### AuthContext Returns null
If `useAuth()` returns null user:
1. `/api/auth/me` endpoint might be failing
2. Check browser DevTools → Network → GET /api/auth/me (should return user data)
3. Cookies might expire → re-login required

### Admin Check Failing
If non-admins can access admin pages:
1. They must be in `admins` table in database
2. Check: `SELECT * FROM admins WHERE user_id = 'your-uuid'`
3. The user_id must match the authenticated user

## Security Benefits

| Feature | Benefit |
|---------|---------|
| Server-side auth | Can't be bypassed by client-side code changes |
| Cookies (httpOnly) | JavaScript can't access/steal tokens |
| Database checks | Admin status verified against source of truth |
| Server-side redirects | Unauthorized users never see protected pages |
| No localStorage | No tokens in browser storage |

## Client Components Using Auth

These components call `useAuth()` for UI display only:
- `Navbar.tsx` - Shows login/profile button
- `FolderCard.tsx` - Shows admin edit button
- `FileCard.tsx` - Shows admin delete button
- Various admin pages - Show UI if user is admin

**Important**: These components do NOT make authorization decisions. That's the server's job.

## Deployment Considerations

1. **Environment Variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. **CORS**: Not an issue since we use same-origin requests
3. **Cookie Scope**: Cookies work automatically across all pages/domains
4. **Session Expiry**: Configured in Supabase, server handles refresh automatically
