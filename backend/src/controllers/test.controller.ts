import { Request, Response } from "express";
import { Prisma, Section, TestType } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { calculateScore, isAutoScorable } from "../services/scoreCalculator";

const TEST_TYPES = Object.values(TestType) as string[];
const SECTIONS = Object.values(Section) as string[];

/**
 * Generic test engine — one implementation for all 7 exam types,
 * parameterized by the TestType / Section enums (PROJECT_BRIEF.md
 * Section 1). No per-exam branches except scoring (scoreCalculator).
 */

/** GET /api/tests?type=IELTS&section=READING */
export async function listTests(req: Request, res: Response): Promise<void> {
  const { type, section } = req.query;
  if (type !== undefined && (typeof type !== "string" || !TEST_TYPES.includes(type))) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${TEST_TYPES.join(", ")}` });
    return;
  }
  if (section !== undefined && (typeof section !== "string" || !SECTIONS.includes(section))) {
    res.status(400).json({ error: `Invalid section. Must be one of: ${SECTIONS.join(", ")}` });
    return;
  }
  const tests = await prisma.test.findMany({
    where: {
      ...(type ? { type: type as TestType } : {}),
      ...(section ? { section: section as Section } : {}),
    },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json({ tests });
}

/** GET /api/tests/:id/questions — correctAnswer is NEVER exposed here. */
export async function getTestQuestions(req: Request, res: Response): Promise<void> {
  const test = await prisma.test.findUnique({
    where: { id: req.params.id },
    include: { questions: { orderBy: { id: "asc" } } },
  });
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }
  const questions = test.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    questionType: q.questionType,
    options: q.options,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    // correctAnswer intentionally omitted until after submission
  }));
  res.status(200).json({
    test: {
      id: test.id,
      type: test.type,
      section: test.section,
      title: test.title,
      duration: test.duration,
    },
    questions,
  });
}

interface AnswerInput {
  questionId?: unknown;
  answer?: unknown;
  textAnswer?: unknown;
  audioUrl?: unknown;
  videoUrl?: unknown;
}

/**
 * POST /api/tests/:id/submit (auth required)
 * Body: {
 *   answers: [{ questionId, answer?, textAnswer?, audioUrl?, videoUrl? }],
 *   timeTaken?: number (seconds)
 * }
 * Returns: { score, maxScore, scaledScore, scale, percentage,
 *            correctAnswers, pendingReview, progressId }
 * `score` is the raw auto-scored correct count (Progress.score);
 * `scaledScore` is on the exam's official scale (Section 2).
 */
export async function submitTest(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const test = await prisma.test.findUnique({
    where: { id: req.params.id },
    include: { questions: true },
  });
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const body = (req.body ?? {}) as { answers?: unknown; timeTaken?: unknown };
  if (!Array.isArray(body.answers)) {
    res.status(400).json({ error: "answers must be an array" });
    return;
  }
  const timeTaken =
    typeof body.timeTaken === "number" && Number.isFinite(body.timeTaken) && body.timeTaken >= 0
      ? Math.round(body.timeTaken)
      : 0;

  const questionById = new Map(test.questions.map((q) => [q.id, q]));
  const answers = body.answers as AnswerInput[];

  // Validate questionIds belong to this test.
  for (const a of answers) {
    if (typeof a.questionId !== "string" || !questionById.has(a.questionId)) {
      res.status(400).json({ error: `Unknown questionId for this test: ${String(a.questionId)}` });
      return;
    }
  }

  let correct = 0;
  let totalAuto = 0;
  let pending = 0;
  const correctAnswers: Array<{ questionId: string; correctAnswer: string; correct: boolean | null }> = [];

  for (const q of test.questions) {
    const submitted = answers.find((a) => a.questionId === q.id);
    const given =
      submitted?.answer !== undefined && submitted?.answer !== null
        ? String(submitted.answer)
        : submitted?.textAnswer !== undefined && submitted?.textAnswer !== null
          ? String(submitted.textAnswer)
          : null;

    if (!isAutoScorable(q.questionType)) {
      pending += submitted ? 1 : 0;
      correctAnswers.push({ questionId: q.id, correctAnswer: q.correctAnswer, correct: null });
      continue;
    }
    totalAuto += 1;
    // Case-insensitive, trimmed comparison (MCQ letters / cloze words).
    const isCorrect = given !== null && given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) correct += 1;
    correctAnswers.push({ questionId: q.id, correctAnswer: q.correctAnswer, correct: isCorrect });
  }

  const result = calculateScore(test.type, correct, totalAuto, pending);

  // Persist Progress + one Submission per answered question (transaction).
  const progress = await prisma.$transaction(async (tx) => {
    const created = await tx.progress.create({
      data: {
        userId: req.user!.id,
        testId: test.id,
        score: result.rawScore,
        maxScore: result.maxScore,
        timeTaken,
      },
    });
    for (const a of answers) {
      await tx.submission.create({
        data: {
          userId: req.user!.id,
          questionId: a.questionId as string,
          testId: test.id,
          textAnswer:
            a.textAnswer !== undefined && a.textAnswer !== null ? String(a.textAnswer) : null,
          audioUrl: typeof a.audioUrl === "string" ? a.audioUrl : null,
          videoUrl: typeof a.videoUrl === "string" ? a.videoUrl : null,
        },
      });
    }
    return created;
  });

  res.status(200).json({
    score: result.rawScore,
    maxScore: result.maxScore,
    scaledScore: result.scaledScore,
    scale: result.scale,
    percentage: result.percentage,
    pendingReview: result.pendingReview,
    correctAnswers,
    progressId: progress.id,
  });
}

// Re-export for route files that need Prisma types (keeps imports tidy).
export type { Prisma };
