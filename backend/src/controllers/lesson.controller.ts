import { Request, Response } from "express";
import { Prisma, TestType } from "@prisma/client";
import { prisma } from "../prisma/client";

const TEST_TYPES = Object.values(TestType) as string[];

function parseCategory(value: unknown): TestType | undefined | null {
  // undefined = not provided, null = invalid, TestType = valid
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !TEST_TYPES.includes(value)) return null;
  return value as TestType;
}

/** GET /api/lessons?category=IELTS */
export async function listLessons(req: Request, res: Response): Promise<void> {
  const category = parseCategory(req.query.category);
  if (category === null) {
    res.status(400).json({ error: `Invalid category. Must be one of: ${TEST_TYPES.join(", ")}` });
    return;
  }
  const lessons = await prisma.lesson.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  res.status(200).json({ lessons });
}

/** GET /api/lessons/:id */
export async function getLesson(req: Request, res: Response): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.status(200).json({ lesson });
}

/** POST /api/lessons (admin only) */
export async function createLesson(req: Request, res: Response): Promise<void> {
  const { title, content, videoUrl, category, order } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required" });
    return;
  }
  const parsedCategory = parseCategory(category);
  if (parsedCategory === undefined || parsedCategory === null) {
    res.status(400).json({ error: `Category is required and must be one of: ${TEST_TYPES.join(", ")}` });
    return;
  }
  if (typeof order !== "number" || !Number.isInteger(order)) {
    res.status(400).json({ error: "Order must be an integer" });
    return;
  }
  if (videoUrl !== undefined && videoUrl !== null && typeof videoUrl !== "string") {
    res.status(400).json({ error: "videoUrl must be a string" });
    return;
  }
  const lesson = await prisma.lesson.create({
    data: {
      title: title.trim(),
      content,
      videoUrl: (videoUrl as string | undefined) ?? null,
      category: parsedCategory,
      order,
    },
  });
  res.status(201).json({ lesson });
}

/** PUT /api/lessons/:id (admin only) — partial update */
export async function updateLesson(req: Request, res: Response): Promise<void> {
  const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  const { title, content, videoUrl, category, order } = (req.body ?? {}) as Record<string, unknown>;
  const data: Prisma.LessonUpdateInput = {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "Title must be a non-empty string" });
      return;
    }
    data.title = title.trim();
  }
  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ error: "Content must be a non-empty string" });
      return;
    }
    data.content = content;
  }
  if (videoUrl !== undefined) {
    if (videoUrl !== null && typeof videoUrl !== "string") {
      res.status(400).json({ error: "videoUrl must be a string or null" });
      return;
    }
    data.videoUrl = videoUrl as string | null;
  }
  if (category !== undefined) {
    const parsed = parseCategory(category);
    if (parsed === undefined || parsed === null) {
      res.status(400).json({ error: `Category must be one of: ${TEST_TYPES.join(", ")}` });
      return;
    }
    data.category = parsed;
  }
  if (order !== undefined) {
    if (typeof order !== "number" || !Number.isInteger(order)) {
      res.status(400).json({ error: "Order must be an integer" });
      return;
    }
    data.order = order;
  }
  const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data });
  res.status(200).json({ lesson });
}

/** DELETE /api/lessons/:id (admin only) */
export async function deleteLesson(req: Request, res: Response): Promise<void> {
  const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  await prisma.lesson.delete({ where: { id: req.params.id } });
  res.status(200).json({ deleted: true, id: req.params.id });
}
