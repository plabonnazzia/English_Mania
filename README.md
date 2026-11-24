# English Test Prep Platform

Full-stack exam preparation platform for **IELTS, GRE, TOEFL, PTE, SAT,
Duolingo English Test (DET), and Cambridge (CAE/CPE)** — built with a
**generic, reusable test engine** parameterized by `TestType` / `Section`
(see `PROJECT_BRIEF.md` Section 1). No per-exam hardcoded modules.

> **Status: Phase 1 complete (Checkpoint 1).** Scaffolding only —
> database schema, auth, and APIs are Phase 2+ and have **not** been
> implemented yet. See `CHANGELOG.md`.

## Tech Stack (PROJECT_BRIEF.md Section 3 — used exactly)

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts, React Hook Form + Zod, Axios, MediaRecorder API |
| Backend  | Node.js + Express, TypeScript, Prisma, JWT + bcrypt |
| Database | PostgreSQL (primary), Redis (flashcard due-queue) |
| Storage  | AWS S3 / Cloudinary (audio/video) |
| Deploy   | Vercel (frontend), Railway (backend), Neon.tech (PostgreSQL) |
| Testing  | Jest, React Testing Library, Postman collection |

## Project Structure

See `PROJECT_BRIEF.md` Section 4 for the exact folder structure, and
`docs/ARCHITECTURE.md` for the architecture overview.

```
english-prep-platform/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express + Prisma
├── docs/
├── docker-compose.yml # Local PostgreSQL + Redis
└── README.md
```

## Local Setup (Phase 1)

### Prerequisites
- Node.js 20+ / npm 10+
- Docker + Docker Compose (for PostgreSQL & Redis)

### 1. Start local database & cache
```bash
docker compose up -d
# PostgreSQL: localhost:5432  (user / password / englishprep)
# Redis:      localhost:6379
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npm run dev                 # http://localhost:5000  (GET /health)
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:3000
```

> **Note:** `npm install` has not been run in the agent sandbox for
> Phase 1 (dependencies are declared in `package.json`). Run it locally
> before `npm run dev`. Database migrations are **Phase 2**.

## Environment Variables

See `.env.example` (root), `backend/.env.example`, and
`frontend/.env.example` — documented per PROJECT_BRIEF.md Section 9.

## Execution Order

Phases 1–8 per PROJECT_BRIEF.md Section 10, with a human-review
checkpoint after each phase. Do not skip phases.

## License

Private — internal project.
