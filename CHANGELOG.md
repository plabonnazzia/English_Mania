# Changelog

All notable work per phase (PROJECT_BRIEF.md Section 10 / Final
Instruction 10). Format: newest phase first.

---

## [Phase 7] — Testing — Checkpoint 7

**Date:** 2026-11-24
**Branch:** `feature/testing` (from `develop`)
**Status:** ✅ Complete — awaiting human review. Phase 8 NOT started.

### Added & Verified
- **Backend Jest**: 3 suites, **28/28 passed** (`auth.test.ts` 9, `sm2Algorithm.test.ts` 7, `scoreCalculator.test.ts` 12).
- **Frontend Jest**: configured `next/jest` in `frontend/jest.config.js` and added `frontend/tests/api.test.ts` — **2/2 passed**.

---

## [Phase 6] — Admin Panel — Checkpoint 6

**Date:** 2026-11-24
**Branch:** `feature/admin-panel` (from `develop`)
**Status:** ✅ Complete — awaiting human review. Phase 7 NOT started.

### Added
- `frontend/app/(dashboard)/admin/users/page.tsx` — admin-only user list (`GET /api/admin/users`) and role toggle (`PATCH /api/admin/users/:id/role`).
- `frontend/app/(dashboard)/admin/content/page.tsx` — admin-only lesson creation (`POST /api/lessons`) and deletion (`DELETE /api/lessons/:id`).
- Removed Phase 1 placeholder `frontend/app/admin/*` to resolve Next.js parallel route conflict with `(dashboard)/admin/*`.

### Verification
- `cd frontend && npx tsc --noEmit` — exit 0 ✅
- `cd frontend && npm run build` — exit 0 ✅

---

## [Phase 5] — Test & Flashcard UI — Checkpoint 5

**Date:** 2026-11-24
**Branch:** `feature/test-flashcard-ui` (from `develop`)
**Status:** ✅ Complete — awaiting human review. Phase 6 NOT started.

### Added
- **Test Engine UI**:
  - `frontend/components/tests/TestInterface.tsx` — countdown timer, question navigation, audio/image rendering, MCQ/Writing/Speaking/Use-of-English inputs, submit & scaled-score results breakdown.
  - `frontend/components/tests/RecordingWidget.tsx` — MediaRecorder audio/video capture + upload to `/api/upload`.
  - `frontend/components/tests/UseOfEnglishQuestion.tsx` — Cambridge CAE/CPE Cloze, Word Formation, and Key Word Transformation input.
  - `frontend/app/(dashboard)/tests/page.tsx` & `frontend/app/(dashboard)/tests/[id]/page.tsx` — exam filter pills + protected test runner.
- **Flashcards UI**:
  - `frontend/components/flashcards/FlashcardReview.tsx` — flip card + SM-2 quality (0–5) rating buttons.
  - `frontend/app/(dashboard)/flashcards/page.tsx` — due queue review + new flashcard creation form.
- **Progress & Analytics UI**:
  - `frontend/components/progress/ProgressChart.tsx` — Recharts `BarChart` score trend.
  - `frontend/app/(dashboard)/progress/page.tsx` — chart + attempt history table.

### Verification
- `cd frontend && npx tsc --noEmit` — exit 0 ✅
- `cd frontend && npm run build` — exit 0 ✅

---

## [Phase 4] — Frontend Core (Auth Pages, Dashboard, Lessons) — Checkpoint 4

**Date:** 2026-11-24
**Branch:** `feature/frontend-core` (from `develop`)
**Status:** ✅ Complete — awaiting human review. Phase 5 NOT started.

### Added
- **API & Auth State**:
  - `frontend/types/index.ts` — shared TypeScript interfaces (`User`, `TestType`, `Lesson`, `DashboardStats`, `ProgressItem`, `AuthResponse`).
  - `frontend/lib/api.ts` — Axios instance with `NEXT_PUBLIC_API_URL` and JWT `Authorization` interceptor.
  - `frontend/store/authStore.ts` — Zustand auth store (`token`, `user`, `setAuth`, `logout`, `hydrate` via `/api/auth/me`).
- **Layout & Navigation**:
  - `frontend/app/layout.tsx`, `frontend/app/page.tsx` — root layout with `Navbar` and landing page for all 7 exams.
  - `frontend/components/Navbar.tsx` & `frontend/components/AuthGuard.tsx` — responsive nav + protected route wrapper.
- **Auth Pages**:
  - `frontend/app/(auth)/login/page.tsx` & `frontend/app/(auth)/register/page.tsx` — React Hook Form + Zod validation, connected to `/api/auth/login` and `/api/auth/register`.
- **Dashboard & Lessons**:
  - `frontend/app/(dashboard)/dashboard/page.tsx` — protected dashboard fetching `/api/progress/dashboard` (tests completed, average score, study time, flashcards due, per-exam breakdown, recent activity).
  - `frontend/app/(dashboard)/lessons/page.tsx`, `frontend/app/(dashboard)/lessons/[id]/page.tsx`, `frontend/components/lessons/LessonContent.tsx` — lesson list with `TestType` category filter pills and lesson detail view with optional video player.

### Verification
- `cd frontend && npx tsc --noEmit` — exit 0 ✅
- `cd frontend && npm run build` — exit 0 ✅ (all App Router routes compiled)

---

## [Phase 3] — Core Backend APIs — Checkpoint 3

**Date:** 2026-11-24
**Branch:** `feature/core-apis` (from `develop`)
**Status:** ✅ Complete — awaiting human review. Phase 4 NOT started.

### Added
- **Lesson CRUD** (`lesson.controller.ts` + routes):
  `GET /api/lessons?category=`, `GET /:id`, `POST` / `PUT` /
  `DELETE` (admin-only via `requireAdmin` from Phase 2).
- **Generic Test engine** (`test.controller.ts` + routes) — one
  implementation for all 7 exam types, parameterized by
  `TestType`/`Section` (no per-exam modules):
  `GET /api/tests?type=&section=`, `GET /:id/questions`
  (correctAnswer never leaked), `POST /:id/submit` (auth) which
  auto-scores, persists `Progress` + `Submission` rows in a
  transaction, and returns `{score, scaledScore, correctAnswers}`.
- **Per-exam scoring** (`services/scoreCalculator.ts`) — single
  generic function covering all 7 scales (Section 2): IELTS
  0–9, GRE 130–170, TOEFL 0–30/section, PTE 10–90, SAT 200–800
  via raw→scaled lookup table (Section 8), DET 10–160 (×5),
  CAE 142–210 / CPE 180–230. Writing/Speaking counted as
  `pendingReview`, never auto-scored. MVP fixed-form
  approximations documented in the file header.
- **SM-2 algorithm** (`services/sm2Algorithm.ts`) — implemented
  **exactly** per Section 7 (calculation order preserved).
  **Unit tests** (`tests/sm2Algorithm.test.ts`): 7 cases covering
  all 5 required scenarios (quality<3 reset, quality≥3 interval,
  easeFactor floor 1.3, first rep → 1, second rep → 6) + ease
  formula + dueDate. Plus `tests/scoreCalculator.test.ts`
  (12 cases, all 7 scales + SAT table).
- **Flashcard endpoints**: `GET /due` (Redis-cached 60s with
  PostgreSQL fallback — Redis optional, never breaks the API),
  `POST /`, `POST /:id/review` (SM-2 update, quality 0–5
  validated), `DELETE /:id` (own cards only).
- **File upload** (`POST /api/upload`, auth, multipart `file`,
  audio/video only, 100 MB max): S3 when `AWS_S3_BUCKET` +
  credentials are set, otherwise local `backend/uploads/`
  fallback (git-ignored, served at `/uploads/...`). Same
  response shape either way.
- **Progress endpoints**: `GET /dashboard` (totals, average %,
  per-exam-type averages, flashcards due, recent attempts —
  feeds Phase 5 charts), `GET /history?testType=`.
- **Admin backend** (`GET /api/admin/users`,
  `PATCH /:id/role`, admin-only, passwords never returned).
  Backend only — admin UI is Phase 6.
- **Seed data** (`src/prisma/seed.ts`, `npm run db:seed`):
  7 lessons + **9 tests / 24 questions** (IELTS×2, GRE×2,
  TOEFL/PTE/SAT/DET/CAE×1 each — including CAE CLOZE /
  WORD_FORMATION types) + dev users
  `student@example.com/password123`,
  `admin@example.com/admin1234`. Idempotent re-runs.
- **Docs**: full `API_DOCUMENTATION.md` (all Section 6
  endpoints), expanded `postman_collection.json` (all Phase 3
  endpoints), `server.ts` mounts all routes + `/uploads` static.

### Verification (live PostgreSQL + running server)
- `tsc --noEmit` ✅ · `npm run build` ✅
- Jest: **28/28 passed** (SM-2 7 + scoring 12 + auth 9 regression)
- Seed: 7 lessons, 9 tests, 24 questions, 2 users ✅
- Live curl: lessons filter + 400 on bad category; tests filter
  by type/section; questions leak **0** correctAnswers; submit
  IELTS 2/3 → band **6.0**, SAT 2/3 → **230** (lookup table),
  CAE 3/3 → **210** (case-insensitive cloze); flashcards
  create→due→review (rep 1, interval 1, ease 2.60)→delete;
  upload audio → local URL, text file → 400; dashboard/history
  aggregates; admin list (no passwords), student → 403 on
  admin routes. Temp test data cleaned up (progress history
  retained as proof).

### Not yet implemented (by design — later phases)
- Frontend pages/components (Phases 4–6)
- Adaptive SAT/DET logic (Phase 2 feature per Section 8)
- Real S3 bucket / production deploy (Phase 8)

### Notes
- Question ordering: the brief's schema has no `order` field
  for questions, so `GET /:id/questions` orders by `id`
  (deterministic). Do not add schema fields without approval.
- `backend/uploads/` (local upload fallback) is git-ignored.

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
