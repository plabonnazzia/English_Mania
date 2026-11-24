import { Router } from "express";
import {
  getDueFlashcards,
  createFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from "../controllers/flashcard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

// GET    /api/flashcards/due
router.get("/due", getDueFlashcards);
// POST   /api/flashcards
router.post("/", createFlashcard);
// POST   /api/flashcards/:id/review  { quality: 0-5 }
router.post("/:id/review", reviewFlashcard);
// DELETE /api/flashcards/:id
router.delete("/:id", deleteFlashcard);

export default router;
