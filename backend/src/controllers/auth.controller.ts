import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { signToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const BCRYPT_ROUNDS = 10;

function isValidEmail(email: string): boolean {
  // Minimal RFC-5322-ish check; full validation is done client-side with Zod (Phase 4).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * → 201 { token, user } | 400 validation | 409 duplicate email
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = (req.body ?? {}) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (typeof email !== "string" || !isValidEmail(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, password: hashedPassword },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * → 200 { token, user } | 400 validation | 401 invalid credentials
 * Note: same 401 message for unknown email / wrong password (no user enumeration).
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = (req.body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || email.trim().length === 0) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user);
  res.status(200).json({ token, user: publicUser(user) });
}

/**
 * GET /api/auth/me  (protected by authMiddleware)
 * → 200 { user } | 401 unauthenticated | 404 user deleted after token issued
 */
export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json({ user: publicUser(user) });
}
