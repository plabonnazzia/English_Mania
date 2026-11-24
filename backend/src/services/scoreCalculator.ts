/**
 * Per-exam scoring — generic engine parameterized by TestType.
 * Single function serves all 7 exam types (PROJECT_BRIEF.md
 * Sections 1, 2, 8). No per-exam modules.
 *
 * MVP note: real exams use adaptive / section-specific raw-to-scaled
 * tables (SAT lookup table, IELTS section tables, GRE adaptive).
 * For MVP fixed-form tests we use documented linear/table
 * approximations below. Writing/Speaking responses are NOT
 * auto-scored (score stays null, pending human review) — only
 * auto-scorable questions count toward the percentage.
 */
import { TestType } from "@prisma/client";

export interface ScoreResult {
  /** Number of auto-scored questions answered correctly. */
  rawScore: number;
  /** Number of auto-scorable questions (excludes writing/speaking). */
  maxScore: number;
  /** Correct / maxScore, 0..1 (0 when no auto-scorable questions). */
  percentage: number;
  /** Scaled score on the exam's official scale (see Section 2). */
  scaledScore: number;
  /** Human-readable scale, e.g. "0-9 (IELTS band)". */
  scale: string;
  /** Number of writing/speaking answers awaiting human review. */
  pendingReview: number;
}

/** Question types that cannot be auto-scored. */
export const MANUAL_QUESTION_TYPES = new Set([
  "SPEAKING",
  "WRITING_TASK",
  "WRITING",
  "SPEAKING_SAMPLE",
  "WRITING_SAMPLE",
]);

export function isAutoScorable(questionType: string): boolean {
  return !MANUAL_QUESTION_TYPES.has(questionType.toUpperCase());
}

/**
 * SAT raw-to-scaled lookup (MVP approximation of the official
 * 200-800 table). Input: raw correct count. Table covers 0..20;
 * values above 20 clamp to 800.
 */
const SAT_SCALED_TABLE: Record<number, number> = {
  0: 200, 1: 210, 2: 230, 3: 260, 4: 290, 5: 320, 6: 350, 7: 380,
  8: 410, 9: 440, 10: 470, 11: 500, 12: 530, 13: 560, 14: 590,
  15: 620, 16: 650, 17: 680, 18: 710, 19: 750, 20: 800,
};

export function satRawToScaled(raw: number): number {
  if (raw <= 0) return 200;
  if (raw >= 20) return 800;
  return SAT_SCALED_TABLE[raw] ?? 200;
}

/**
 * Convert a percentage (0..1) to the exam's scaled score.
 * Exported separately so it can be unit-tested per exam type.
 */
export function percentageToScaledScore(testType: TestType, percentage: number): number {
  const p = Math.min(1, Math.max(0, percentage));
  switch (testType) {
    case "IELTS":
      // 0-9 in 0.5 steps (MVP linear approximation of section tables).
      return Math.round(p * 9 * 2) / 2;
    case "GRE":
      // Verbal/Quant 130-170 in 1-point steps (MVP fixed-form approx;
      // real GRE is adaptive). AWA (0-6) is human-scored — see below.
      return 130 + Math.round(p * 40);
    case "TOEFL":
      // Per-section 0-30 (total 0-120 across 4 sections).
      return Math.round(p * 30);
    case "PTE":
      // 10-90.
      return 10 + Math.round(p * 80);
    case "SAT":
      // 200-800 via lookup table on raw count — handled in
      // calculateScore where raw is known; here approximate by
      // interpolating the table at p*20 for callers with only %.
      return satRawToScaled(Math.round(p * 20));
    case "DET":
      // 10-160 in increments of 5.
      return Math.round((10 + p * 150) / 5) * 5;
    case "CAE":
      // Cambridge English Scale 142-210.
      return 142 + Math.round(p * 68);
    case "CPE":
      // Cambridge English Scale 180-230.
      return 180 + Math.round(p * 50);
    default:
      return Math.round(p * 100);
  }
}

export function scaleLabel(testType: TestType): string {
  switch (testType) {
    case "IELTS": return "0-9 (IELTS band)";
    case "GRE": return "130-170 (GRE Verbal/Quant)";
    case "TOEFL": return "0-30 per section (0-120 total)";
    case "PTE": return "10-90";
    case "SAT": return "200-800 per section";
    case "DET": return "10-160 (increments of 5)";
    case "CAE": return "142-210 (Cambridge English Scale)";
    case "CPE": return "180-230 (Cambridge English Scale)";
    default: return "0-100";
  }
}

/**
 * Calculate the score for a submitted test.
 * @param testType  Exam type (parameterizes the scale).
 * @param correct   Auto-scored correct count.
 * @param totalAuto Auto-scorable question count.
 * @param pending   Writing/speaking answers awaiting review.
 */
export function calculateScore(
  testType: TestType,
  correct: number,
  totalAuto: number,
  pending = 0,
): ScoreResult {
  const percentage = totalAuto > 0 ? correct / totalAuto : 0;
  // SAT uses the raw-count lookup table directly (Section 8).
  const scaledScore =
    testType === "SAT"
      ? satRawToScaled(correct)
      : percentageToScaledScore(testType, percentage);
  return {
    rawScore: correct,
    maxScore: totalAuto,
    percentage,
    scaledScore,
    scale: scaleLabel(testType),
    pendingReview: pending,
  };
}
