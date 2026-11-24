import { Router } from "express";
import { listUsers, updateUserRole } from "../controllers/admin.controller";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware, requireAdmin);

// GET   /api/admin/users
router.get("/users", listUsers);
// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", updateUserRole);

export default router;
