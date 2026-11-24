# Changelog

All notable work per phase (PROJECT_BRIEF.md Section 10 / Final
Instruction 10). Format: newest phase first.

---

## [Phase 2] — Database & Auth — Checkpoint 2

**Date:** 2026-11-24
**Branch:** `feature/database-auth` (from `develop`, per branch
strategy `main → develop → feature/*`)
**Status:** ✅ Complete — awaiting human review. Phase 3 NOT started.

### Added
- **Full Prisma schema** (`backend/src/prisma/schema.prisma`) —
  implemented **exactly** per PROJECT_BRIEF.md Section 5: enums
  `Role`, `TestType`, `Section` (16 values) and models `User`,
  `Lesson`, `Test`, `Question`, `Flashcard`, `Progress`,
  `Submission`. No fields/enums renamed or added (Final
  Instruction 4). `Submission` kept relation-free as specified.
- **Migration run:** `prisma migrate dev --name initial` →
  `src/prisma/migrations/20261124073000_initial/migration.sql`
  applied to PostgreSQL. Verified 7 tables (`User`, `Lesson`,
  `Test`, `Question`, `Flashcard`, `Progress`, `Submission`)
  + `_prisma_migrations`. `prisma validate` ✅, `prisma generate`
  ✅ (Prisma Client v5.22.0).
- **Auth (JWT + bcrypt):**
  - `POST /api/auth/register` — validation (name required, valid
    email, password ≥ 8 chars), duplicate-email `409`, bcrypt
    hash (10 rounds), returns `201 { token, user }`.
  - `POST /api/auth/login` — `200 { token, user }`, generic
    `401` for unknown email / wrong password (no enumeration).
  - `GET /api/auth/me` — protected, returns current user.
  - `auth.middleware.ts`: `signToken` (HS256, 7d, payload
    `{ sub, email, role }`), `authMiddleware` (Bearer check,
    `401` on missing/invalid/expired), `requireRole` /
    `requireAdmin` guards for later phases.
  - `errorHandler.ts`: `notFoundHandler` + central `errorHandler`
    (no stack traces in production).
  - `prisma/client.ts`: PrismaClient singleton.
  - `server.ts` now mounts `/api/auth` + error handlers;
    Phase 3 routes left as commented placeholders.
- **Postman collection** (`docs/postman_collection.json`) —
  Register / Login / Me, with Login auto-saving the token.
- **ER diagram** (`docs/ER_DIAGRAM.png` + `docs/ER_DIAGRAM.md`
  with Mermaid source), generated from the implemented schema.
- **Tests:** `backend/tests/auth.test.ts` — 9 supertest cases
  (register 201/409/400, login 200/401, `/me` 200/401/401).
  All passing against the live database (see Verification).

### Verification (run in sandbox against real PostgreSQL 17)
- `npx tsc --noEmit` ✅ · `npm run build` ✅
- `npx jest tests/auth.test.ts` — **9/9 passed**
- Live server + curl: register `201`, login `200` (JWT 253 chars),
  `/me` `200` with token / `401` without, wrong password `401`,
  duplicate register `409`. Test user cleaned up afterwards.
- Note: sandbox has no Docker, so PostgreSQL 17 was installed
  via apt and the `englishprep` DB / `user` role created to
  match `docker-compose.yml` / `.env.example`. Locally, use
  `docker compose up -d` instead — same credentials.

### Not yet implemented (by design — later phases)
- Lesson / Test / Flashcard / Upload / Progress / Admin APIs,
  SM-2 algorithm, per-exam scoring (Phase 3)
- Frontend auth pages (Phase 4)

### Notes
- Prisma schema lives at `backend/src/prisma/schema.prisma`
  per the brief's folder structure (Section 4). All Prisma
  scripts in `backend/package.json` pass
  `--schema=src/prisma/schema.prisma` accordingly.
- `backend/.env` (real secrets) and `dist/` / `node_modules/`
  are git-ignored and were **not** committed. `package-lock.json`
  **was** committed.

---

## [Phase 1] — Setup — Checkpoint 1

**Date:** 2026-11-24
**Status:** ✅ Complete — awaiting human review. Phase 2 NOT started.

### Added
- Initialized `frontend/` — Next.js 14 (App Router) + TypeScript +
  Tailwind CSS scaffolding (`package.json`, `tsconfig.json`,
  `tailwind.config.ts`, `postcss.config.js`, `next.config.js`,
  `app/layout.tsx`, `app/globals.css`, placeholder route pages for
  every route in PROJECT_BRIEF.md Section 4).
- Initialized `backend/` — Express + TypeScript + Prisma scaffolding
  (`package.json`, `tsconfig.json`, minimal `src/server.ts` with
  `GET /health`, empty `controllers/`, `routes/`, `middleware/`,
  `services/`, `prisma/`, `tests/` directories per Section 4).
- `docker-compose.yml` — local PostgreSQL 15 + Redis 7 for dev.
- Root `.gitignore`, `.env.example`, `backend/.env.example`,
  `frontend/.env.example` (Section 9 variables).
- `README.md` with Phase 1 setup instructions.
- `docs/ARCHITECTURE.md` (initial), `docs/API_DOCUMENTATION.md`
  (placeholder — full spec in Phase 3).
- `.github/workflows/ci.yml` (skeleton — completed in Phase 8).

### Not yet implemented (by design — later phases)
- Prisma schema & migrations (Phase 2)
- Auth / JWT (Phase 2)
- Lesson / Test / Flashcard / Progress APIs (Phase 3)
- Frontend pages beyond placeholders (Phases 4–6)

### Notes
- Docker is not available in the agent sandbox, so
  `docker compose up` could not be executed here — the compose file
  is provided for local dev and will be verified in Phase 2.
- `npm install` not run in sandbox; dependencies declared in
  `package.json` files for local install.
