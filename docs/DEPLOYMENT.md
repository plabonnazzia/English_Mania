# Deployment Guide

## 1. Database — Neon (PostgreSQL)
1. Create a Neon project and copy the connection string (`DATABASE_URL`).
2. Run migrations from `backend/`:
   ```bash
   DATABASE_URL="<neon-url>" npx prisma migrate deploy --schema=src/prisma/schema.prisma
   DATABASE_URL="<neon-url>" npm run db:seed   # optional initial seed
   ```

## 2. Backend — Railway
1. Connect the repository and set Root Directory to `backend`.
2. `backend/railway.json` configures build (`prisma:generate` + `tsc`) and start (`prisma migrate deploy` + `node dist/server.js`) with `/health` check.
3. Set environment variables (see `backend/.env.example`):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` (Railway sets this automatically)
   - `REDIS_URL` (optional; falls back to PostgreSQL if unset)
   - `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (optional; falls back to local `uploads/` if unset)

## 3. Frontend — Vercel
1. Import the repository and set Root Directory to `frontend`.
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g. `https://your-app.up.railway.app`)
3. Deploy.
