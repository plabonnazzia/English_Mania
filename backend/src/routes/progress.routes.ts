import { Router } from "express";
import { getDashboard, getHistory } from "../controllers/progress.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

// GET /api/progress/dashboard
router.get("/dashboard", getDashboard);
// GET /api/progress/history?testType=IELTS
router.get("/history", getHistory);

export default router;
