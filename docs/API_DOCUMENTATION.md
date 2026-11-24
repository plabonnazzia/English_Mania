# API Documentation — English Test Prep Platform

Base URL (local dev): `http://localhost:5000`
All `/api/*` responses are JSON. Errors: `{ "error": "<message>" }`
with the HTTP status shown per endpoint.

> Phase 2: Auth endpoints only. Lessons / Tests / Flashcards /
> Upload / Progress / Admin endpoints are added in Phase 3
> (PROJECT_BRIEF.md Section 6).

## Authentication

JWT (HS256, 7-day expiry). Send on protected routes:

```
Authorization: Bearer <token>
```

Token payload: `{ sub: <userId>, email, role }`. Passwords are
stored as bcrypt hashes (10 rounds) — never returned in responses.

### POST /api/auth/register

Register a new student account.

**Request**
```json
{ "name": "Test Student", "email": "student@example.com", "password": "password123" }
```

**Responses**
- `201` — `{ "token": "<jwt>", "user": { "id", "name", "email", "role": "STUDENT", "createdAt" } }`
- `400` — missing/invalid name, invalid email, or password < 8 chars
- `409` — email already registered

### POST /api/auth/login

**Request**
```json
{ "email": "student@example.com", "password": "password123" }
```

**Responses**
- `200` — `{ "token": "<jwt>", "user": { ... } }`
- `400` — missing email or password
- `401` — invalid email or password (same message either way)

### GET /api/auth/me  🔒

Returns the currently authenticated user. Requires `Authorization: Bearer <token>`.

**Responses**
- `200` — `{ "user": { "id", "name", "email", "role", "createdAt" } }`
- `401` — missing, malformed, invalid, or expired token
- `404` — user deleted after token was issued

## Postman

Import `docs/postman_collection.json` (Register → Login → Me).
The Login request saves its token into the `token` collection
variable automatically.

## Health

### GET /health
`200` — `{ "status": "ok", "phase": 2 }`
