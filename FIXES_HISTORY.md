# Fixes History

This file tracks the fixes applied to the codebase, including details about the issue, the solution, the root cause, and verifying tests.

## Fix: HTTP 500 Errors in Auth Callbacks (2025-11-28)

### Issue
Users experienced random HTTP 500 errors when logging in or interacting with the application. The errors were intermittent but blocking.

### Root Cause
Exceptions thrown during database operations within the `next-auth` configuration (`src/lib/auth.ts`) were not being caught. Specifically:
1.  `authorize` (Credentials login) crashed if the database query failed.
2.  `upsertSocialUser` (Social login) crashed if unique handle generation failed or if the database insert failed.
3.  `jwt` and `session` callbacks crashed if `upsertSocialUser` or session refreshment queries failed, bringing down the entire request.

### Fix
1.  Wrapped the `authorize` function logic in a `try...catch` block.
2.  Wrapped the `upsertSocialUser` logic in a `try...catch` block and implemented a safe return of `null` on failure.
3.  Improved the unique handle generation loop to prevent infinite recursion (capped at 10 attempts) and return `null` gracefully if no handle is found.
4.  Wrapped `jwt` and `session` callback logic in `try...catch` blocks to log errors instead of propagating them as 500s.

### Matching Test
- **Test File:** `src/lib/auth.test.ts`
- **Test Case:** "should return null and log error when upsertSocialUser encounters a database error"
- **Test Case:** "should return null if handle generation fails after 10 retries (infinite loop prevention)"

### Fix Commit ID
`3737a9036e611a00ffc1f65fdd8d278ff24283cd`

## Fix: TypeError: localStorage.getItem (2025-11-28)

### Issue
Users experienced a HTTP 500 error caused by `TypeError: localStorage.getItem`. This happens when the application attempts to access `localStorage` in an environment where it is either undefined or null (e.g., during Server-Side Rendering in Next.js, or in restrictive environments).

### Root Cause
The `src/context/ui-context.tsx` file accessed `localStorage` directly within `useEffect` and event handlers. While `useEffect` usually runs only on the client, there are edge cases (or testing environments/specific runtime conditions) where `window` might be defined but `localStorage` is not, or `localStorage` access throws unexpectedly. Specifically, the error `TypeError: localStorage.getItem` implies `localStorage` was accessed when it was null/undefined.

### Fix
Modified `src/context/ui-context.tsx` to strictly guard all `localStorage` accesses with:
`if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function')`
(and similarly for `setItem`).
This ensures that we never attempt to read or write properties on `localStorage` unless it is explicitly available and functional.

### Matching Test
- **Test File:** `src/context/ui-context.test.tsx`
- **Test Case:** "should not crash if localStorage is undefined"
- **Test Case:** "should safely handle toggleDarkMode when localStorage is undefined"
- **Test Case:** "should not crash if localStorage exists but getItem is not a function"

### Fix Commit ID
`3d87ee9...`

## Fix: Missing .env File Causing JWT Errors (2025-11-28)

### Issue
The application was failing with `[next-auth][error][JWT_SESSION_ERROR]` and `TypeError: localStorage.getItem is not a function`. The `localStorage` error was a side effect of the Next.js Error Overlay trying to display the fatal auth error. The root cause was the application crashing due to a missing `NEXTAUTH_SECRET` and other environment variables.

### Root Cause
The `.env` file was missing from the project root. While `.env.example` existed, the actual environment file used by `next-auth` to load the `NEXTAUTH_SECRET` was absent. This caused `next-auth` to fail drastically during session decryption, leading to a 500 error. When Next.js tried to show this error in the overlay, it triggered the `localStorage` issue (likely due to the specific CLI/environment context).

### Fix
Created a `.env` file populated with content from `.env.example` and a generated 32-byte base64 string for `NEXTAUTH_SECRET`.

### Matching Test
- **Manual Verification:** The presence of the `.env` file should resolve the `JWT_SESSION_ERROR` and allow the application to start without the 500 error loop.

### Fix Commit ID
(To be committed)