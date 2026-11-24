import { Request, Response } from "express";
import { TestType } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { calculateSM2 } from "../services/sm2Algorithm";
import { cacheGet, cacheSet, cacheDel, dueQueueKey } from "../services/redis";

const TEST_TYPES = Object.values(TestType) as string[];

/** GET /api/flashcards/due — cards with dueDate <= now (Redis-cached, DB fallback). */
export async function getDueFlashcards(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const key = dueQueueKey(req.user.id);
  const cached = await cacheGet<unknown[]>(key);
  if (cached) {
    res.status(200).json({ flashcards: cached, cached: true });
    return;
  }
  const flashcards = await prisma.flashcard.findMany({
    where: { userId: req.user.id, dueDate: { lte: new Date() } },
    orderBy: { dueDate: "asc" },
  });
  await cacheSet(key, flashcards, 60);
  res.status(200).json({ flashcards, cached: false });
}

/** POST /api/flashcards — create a card for the current user. */
export async function createFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { front, back, category } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof front !== "string" || front.trim().length === 0) {
    res.status(400).json({ error: "Front is required" });
    return;
  }
  if (typeof back !== "string" || back.trim().length === 0) {
    res.status(400).json({ error: "Back is required" });
    return;
  }
  if (typeof category !== "string" || !TEST_TYPES.includes(category)) {
    res.status(400).json({ error: `Category is required and must be one of: ${TEST_TYPES.join(", ")}` });
    return;
  }
  const card = await prisma.flashcard.create({
    data: {
      userId: req.user.id,
      front: front.trim(),
      back: back.trim(),
      category: category as TestType,
    },
  });
  await cacheDel(dueQueueKey(req.user.id));
  res.status(201).json({ flashcard: card });
}

/** POST /api/flashcards/:id/review — body { quality: 0-5 } → SM-2 update. */
export async function reviewFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { quality } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof quality !== "number" || !Number.isInteger(quality) || quality < 0 || quality > 5) {
    res.status(400).json({ error: "Quality must be an integer between 0 and 5" });
    return;
  }
  const card = await prisma.flashcard.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!card) {
    res.status(404).json({ error: "Flashcard not found" });
    return;
  }
  const next = calculateSM2({
    quality,
    repetitions: card.repetitions,
    easeFactor: card.easeFactor,
    interval: card.interval,
  });
  const updated = await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      interval: next.interval,
      dueDate: next.dueDate,
    },
  });
  await cacheDel(dueQueueKey(req.user.id));
  res.status(200).json({ flashcard: updated });
}

/** DELETE /api/flashcards/:id — own cards only. */
export async function deleteFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const card = await prisma.flashcard.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!card) {
    res.status(404).json({ error: "Flashcard not found" });
    return;
  }
  await prisma.flashcard.delete({ where: { id: card.id } });
  await cacheDel(dueQueueKey(req.user.id));
  res.status(200).json({ deleted: true, id: card.id });
}
