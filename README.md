# Social Media App (Next.js)

Social feed with authentication, Prisma/SQLite, and Radix UI/Tailwind styling.

## Prerequisites
- Node 18+
- npm (lockfile is npm)

## Environment
Copy `.env.example` to `.env` and set:
- `DATABASE_URL` (default: `file:./dev.db`)
- `NEXTAUTH_SECRET` (32+ chars)
- OAuth keys if using social login (`GITHUB_ID`, etc.)
- To enable verbose NextAuth logs: `NEXTAUTH_DEBUG=true`

## Setup
```bash
npm install
npx prisma migrate dev --name init   # creates SQLite schema
npm run prisma:seed                  # populate dev.db with demo users/communities/posts
```

### Database & Seed
- Uses SQLite at `prisma/dev.db` (from `DATABASE_URL`).
- Seed script: `prisma/seed.ts` (creates admin/user accounts, communities, sample posts).
- Run `npm run prisma:seed` after migrations whenever you want fresh demo data.

## Run
```bash
npm run dev
```
App: http://localhost:3000  
Do not start Node with an invalid `--localstorage-file` flag; it breaks `localStorage` in dev.

## Tests
```bash
npx vitest run
```

## Notes
- Images use `images.remotePatterns` (see `next.config.ts`).
- Auth debug is opt-in (`NEXTAUTH_DEBUG`).
- Feed pagination stops when a page returns fewer than 10 items; duplicate posts are deduped client-side.
