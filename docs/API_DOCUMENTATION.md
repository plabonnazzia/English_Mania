# API Documentation — English Test Prep Platform

Base URL (local dev): `http://localhost:5000`
All `/api/*` responses are JSON. Errors: `{ "error": "<message>" }`
with the HTTP status shown per endpoint.

Seed data (required for Lessons/Tests examples):
```bash
npm run db:seed   # 7 lessons, 9 tests (IELTSx2, GREx2, +1 each other), 24 questions
```
Dev users: `student@example.com / password123` (STUDENT),
`admin@example.com / admin1234` (ADMIN).

## Authentication

JWT (HS256, 7-day expiry). Send on protected routes:

```
Authorization: Bearer <token>
```

Token payload: `{ sub: <userId>, email, role }`. Passwords are
bcrypt hashes (10 rounds) — never returned in responses.

### POST /api/auth/register
`{name, email, password}` → `201 {token, user}` | `400` validation | `409` duplicate email

### POST /api/auth/login
`{email, password}` → `200 {token, user}` | `400` | `401` invalid credentials

### GET /api/auth/me 🔒
→ `200 {user}` | `401` | `404` user deleted

## Lessons

### GET /api/lessons?category=IELTS
List lessons, optionally filtered by `TestType`. → `200 {lessons}` | `400` invalid category

### GET /api/lessons/:id
→ `200 {lesson}` | `404`

### POST /api/lessons 🔒👑 (admin only)
`{title, content, videoUrl?, category, order}` → `201 {lesson}` | `400` | `403` non-admin

### PUT /api/lessons/:id 🔒👑 (admin only, partial update)
→ `200 {lesson}` | `400` | `403` | `404`

### DELETE /api/lessons/:id 🔒👑 (admin only)
→ `200 {deleted: true, id}` | `403` | `404`

## Tests — generic engine (all 7 exam types)

### GET /api/tests?type=SAT&section=SAT_MATH
List tests filtered by `type` (TestType) and/or `section` (Section).
Each test includes `_count.questions`. → `200 {tests}` | `400` invalid filter

### GET /api/tests/:id/questions
Returns test metadata + questions **without** `correctAnswer`
(answers are never leaked before submission).
→ `200 {test, questions}` | `404`

### POST /api/tests/:id/submit 🔒
```json
{
  "answers": [
    { "questionId": "<uuid>", "answer": "<selected option text>",
      "textAnswer": "<optional>", "audioUrl": "<optional>", "videoUrl": "<optional>" }
  ],
  "timeTaken": 600
}
```
- `answer` is compared case-insensitively (trimmed) to
  `correctAnswer`. Send the selected option's text.
- Writing/Speaking question types are not auto-scored; they are
  counted in `pendingReview` and their `correct` is `null`.
- Creates one `Progress` + one `Submission` per answer.

→ `200 { score, maxScore, scaledScore, scale, percentage,
pendingReview, correctAnswers, progressId }`
where `score` is the raw correct count and `scaledScore` is on
the exam's official scale:

| Exam | Scale |
|---|---|
| IELTS | 0–9 (0.5 steps) |
| GRE | 130–170 (Verbal/Quant) |
| TOEFL | 0–30 per section (0–120 total) |
| PTE | 10–90 |
| SAT | 200–800 per section (raw→scaled lookup table) |
| DET | 10–160 (increments of 5) |
| CAE / CPE | 142–210 / 180–230 (Cambridge English Scale) |

MVP note: fixed-form approximations of the official adaptive /
section tables (see `scoreCalculator.ts` header). `400` invalid
answers, `401` unauthenticated, `404` test not found.

## Flashcards (SM-2)

All 🔒 (current user only; cards are never shared across users).

### GET /api/flashcards/due
Cards with `dueDate <= now`, soonest first. Redis-cached for
60s when Redis is available; falls back to PostgreSQL otherwise.
→ `200 {flashcards, cached}`

### POST /api/flashcards
`{front, back, category}` → `201 {flashcard}` (defaults:
easeFactor 2.5, interval 1, repetitions 0, due now) | `400`

### POST /api/flashcards/:id/review
`{quality: 0-5}` → `200 {flashcard}` with SM-2-updated
`repetitions / easeFactor / interval / dueDate` | `400` quality out of range | `404`

### DELETE /api/flashcards/:id
→ `200 {deleted: true, id}` | `404`

## Upload 🔒

### POST /api/upload
Multipart form field `file` (audio/* or video/*, max 100 MB).
→ `201 {url, key, filename}`. Production uploads to S3 when
`AWS_S3_BUCKET` + credentials are set; otherwise saves locally
under `backend/uploads/` and returns a `/uploads/...` URL.

## Progress 🔒

### GET /api/progress/dashboard
Aggregates for the dashboard charts:
`{totalTests, totalTimeSeconds, averagePercentage,
flashcardsDue, totalFlashcards, byTestType, recentProgress}`

### GET /api/progress/history?testType=IELTS
Past attempts, newest first, optionally filtered by exam type.
→ `200 {history}` | `400` invalid testType

## Admin 🔒👑 (backend only — UI in Phase 6)

### GET /api/admin/users
→ `200 {users}` (no passwords) | `403` non-admin

### PATCH /api/admin/users/:id/role
`{role: "STUDENT" | "ADMIN"}` → `200 {user}` | `400` | `403` | `404`

## Health

### GET /health
`200` — `{ "status": "ok", "phase": 3 }`

## Postman

Import `docs/postman_collection.json`. Run Auth Register → Login
first (Login saves `token`). Admin requests need the admin token.
