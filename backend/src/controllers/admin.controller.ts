import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../prisma/client";

/**
 * Admin endpoints (PROJECT_BRIEF.md Section 6).
 * Backend only in Phase 3 — admin UI is Phase 6.
 * All routes are guarded by authMiddleware + requireAdmin.
 */

const ROLES = Object.values(Role) as string[];

/** GET /api/admin/users — list users (passwords never returned). */
export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ users });
}

/** PATCH /api/admin/users/:id/role — body { role: "STUDENT" | "ADMIN" } */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { role } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof role !== "string" || !ROLES.includes(role)) {
    res.status(400).json({ error: `Role must be one of: ${ROLES.join(", ")}` });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: role as Role },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  res.status(200).json({ user });
}
