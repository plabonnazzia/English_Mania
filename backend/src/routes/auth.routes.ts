import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/register  { name, email, password } -> { token, user }
router.post("/register", register);

// POST /api/auth/login     { email, password } -> { token, user }
router.post("/login", login);

// GET  /api/auth/me        (Bearer token required) -> { user }
router.get("/me", authMiddleware, me);

export default router;
