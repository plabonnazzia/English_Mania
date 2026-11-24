import { Request, Response } from "express";
import { TestType } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const TEST_TYPES = Object.values(TestType) as string[];

/**
 * GET /api/progress/dashboard — aggregated stats for the current user.
 * Powers the frontend dashboard (Phase 5 charts).
 */
export async function getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const [history, dueCount, totalCards] = await Promise.all([
    prisma.progress.findMany({
      where: { userId },
      include: { test: { select: { id: true, type: true, section: true, title: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.flashcard.count({ where: { userId, dueDate: { lte: new Date() } } }),
    prisma.flashcard.count({ where: { userId } }),
  ]);

  const totalTests = history.length;
  const totalTimeSeconds = history.reduce((sum, p) => sum + p.timeTaken, 0);
  const scored = history.filter((p) => p.maxScore > 0);
  const averagePercentage =
    scored.length > 0
      ? scored.reduce((sum, p) => sum + p.score / p.maxScore, 0) / scored.length
      : 0;

  // Average percentage per exam type (for dashboard charts).
  const byType: Record<string, { attempts: number; averagePercentage: number }> = {};
  for (const p of history) {
    const t = p.test.type;
    if (!byType[t]) byType[t] = { attempts: 0, averagePercentage: 0 };
    byType[t].attempts += 1;
  }
  for (const t of Object.keys(byType)) {
    const rows = history.filter((p) => p.test.type === t && p.maxScore > 0);
    byType[t].averagePercentage =
      rows.length > 0 ? rows.reduce((s, p) => s + p.score / p.maxScore, 0) / rows.length : 0;
  }

  const recent = [...history].reverse().slice(0, 5);

  res.status(200).json({
    totalTests,
    totalTimeSeconds,
    averagePercentage,
    flashcardsDue: dueCount,
    totalFlashcards: totalCards,
    byTestType: byType,
    recentProgress: recent,
  });
}

/** GET /api/progress/history?testType=IELTS */
export async function getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { testType } = req.query;
  if (testType !== undefined && (typeof testType !== "string" || !TEST_TYPES.includes(testType))) {
    res.status(400).json({ error: `Invalid testType. Must be one of: ${TEST_TYPES.join(", ")}` });
    return;
  }
  const history = await prisma.progress.findMany({
    where: {
      userId: req.user.id,
      ...(testType ? { test: { type: testType as TestType } } : {}),
    },
    include: { test: { select: { id: true, type: true, section: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ history });
}
