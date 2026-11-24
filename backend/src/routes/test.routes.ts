import { Router } from "express";
import { listTests, getTestQuestions, submitTest } from "../controllers/test.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET  /api/tests?type=SAT&section=SAT_MATH
router.get("/", listTests);
// GET  /api/tests/:id/questions
router.get("/:id/questions", getTestQuestions);
// POST /api/tests/:id/submit  (auth required)
router.post("/:id/submit", authMiddleware, submitTest);

export default router;
