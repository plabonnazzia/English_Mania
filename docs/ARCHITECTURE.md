# Architecture — English Test Prep Platform

> Initial version — Phase 1. Updated as phases complete.

## Overview

Generic, reusable test engine parameterized by `TestType` and
`Section` enums (PROJECT_BRIEF.md Sections 1, 5). The same
`TestInterface`, scoring logic, and question-bank APIs serve all
7 exam types: IELTS, GRE, TOEFL, PTE, SAT, DET, CAE/CPE.
MVP: IELTS + GRE first, then extend the same engine.

## System Diagram (text)

```
Browser (Next.js 14 / React / Tailwind / Zustand / Recharts)
        │  HTTPS / Axios  (NEXT_PUBLIC_API_URL)
        ▼
Express API (TypeScript) ── JWT auth (bcrypt) ── Prisma ORM
        │                         │
        ├──────────────► PostgreSQL (Neon in prod / Docker locally)
        ├──────────────► Redis (flashcard due-queue)
        └──────────────► S3 / Cloudinary (audio/video uploads)
```

## Key Design Decisions (per brief)

- **Generic test engine:** `GET /api/tests?type=&section=` and
  `POST /api/tests/:id/submit` work for every exam; per-exam
  scoring lives in `backend/src/services/scoreCalculator.ts`
  (Phase 3), parameterized by `TestType`.
- **SM-2 spaced repetition:** `backend/src/services/sm2Algorithm.ts`
  implemented exactly as PROJECT_BRIEF.md Section 7 (Phase 3).
- **Cambridge Use of English:** dedicated
  `UseOfEnglishQuestion.tsx` for open cloze / word formation /
  key-word transformation (Phase 5).
- **Speaking / DET recording:** `RecordingWidget.tsx` using the
  browser MediaRecorder API + `POST /api/upload` (Phases 3 & 5).

## Folder Structure

See PROJECT_BRIEF.md Section 4 — implemented exactly in Phase 1.
