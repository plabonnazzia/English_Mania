/**
 * SM-2 spaced repetition algorithm.
 * Implemented EXACTLY as specified in PROJECT_BRIEF.md Section 7.
 * Do not modify the calculation order: interval is computed from the
 * OLD easeFactor, then easeFactor is updated and clamped to >= 1.3.
 */

export interface SM2Input {
  quality: number;       // 0-5, user's self-rated recall quality
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  dueDate: Date;
}

export function calculateSM2(input: SM2Input): SM2Output {
  let { quality, repetitions, easeFactor, interval } = input;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { repetitions, easeFactor, interval, dueDate };
}
