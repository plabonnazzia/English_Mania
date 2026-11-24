import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";
import lessonRoutes from "./routes/lesson.routes";
import testRoutes from "./routes/test.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import uploadRoutes from "./routes/upload.routes";
import progressRoutes from "./routes/progress.routes";
import adminRoutes from "./routes/admin.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Local upload fallback files (dev only; production uses S3 URLs).
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Health check (Phase 1)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", phase: 3 });
});

// Phase 2: Auth
app.use("/api/auth", authRoutes);
// Phase 3: Core APIs (PROJECT_BRIEF.md Section 6)
app.use("/api/lessons", lessonRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 5000);
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

export default app;
