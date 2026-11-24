import { Router } from "express";
import {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// GET    /api/lessons?category=IELTS
router.get("/", listLessons);
// GET    /api/lessons/:id
router.get("/:id", getLesson);
// POST   /api/lessons        (admin only)
router.post("/", authMiddleware, requireAdmin, createLesson);
// PUT    /api/lessons/:id    (admin only)
router.put("/:id", authMiddleware, requireAdmin, updateLesson);
// DELETE /api/lessons/:id    (admin only)
router.delete("/:id", authMiddleware, requireAdmin, deleteLesson);

export default router;
