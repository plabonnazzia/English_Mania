import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Phase 1: health check only. Routes are added in Phase 3
// (PROJECT_BRIEF.md Section 6) — do not add business logic here yet.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", phase: 1 });
});

const PORT = Number(process.env.PORT ?? 5000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});

export default app;
