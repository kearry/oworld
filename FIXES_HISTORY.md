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
