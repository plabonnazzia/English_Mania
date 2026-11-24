# Changelog

All notable work per phase (PROJECT_BRIEF.md Section 10 / Final
Instruction 10). Format: newest phase first.

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
