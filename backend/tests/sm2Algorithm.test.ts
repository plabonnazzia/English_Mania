/**
 * SM-2 unit tests — PROJECT_BRIEF.md Section 7.
 * Required coverage (all present below):
 *  1. quality < 3 resets repetitions
 *  2. quality >= 3 increases interval correctly
 *  3. easeFactor never goes below 1.3
 *  4. first repetition sets interval to 1
 *  5. second repetition sets interval to 6
 * Plus: easeFactor update formula and dueDate calculation.
 */
import { calculateSM2 } from "../src/services/sm2Algorithm";

describe("calculateSM2", () => {
  it("quality < 3 resets repetitions to 0 and interval to 1", () => {
    const result = calculateSM2({
      quality: 2,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 10,
    });
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("quality >= 3 increases interval correctly (interval * easeFactor)", () => {
    // repetitions 2 -> 3, so interval = round(6 * 2.5) = 15
    const result = calculateSM2({
      quality: 4,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    });
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(15);
  });

  it("easeFactor never goes below 1.3", () => {
    // quality 0: 1.3 + (0.1 - 5 * (0.08 + 5 * 0.02)) = 1.3 - 0.8 = 0.5 -> clamped
    const result = calculateSM2({
      quality: 0,
      repetitions: 0,
      easeFactor: 1.3,
      interval: 1,
    });
    expect(result.easeFactor).toBe(1.3);
  });

  it("first repetition sets interval to 1", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    });
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it("second repetition sets interval to 6", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 1,
      easeFactor: 2.5,
      interval: 1,
    });
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it("quality 5 increases easeFactor by 0.1", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    });
    expect(result.easeFactor).toBeCloseTo(2.6, 10);
  });

  it("dueDate is interval days in the future", () => {
    const before = Date.now();
    const result = calculateSM2({
      quality: 5,
      repetitions: 1,
      easeFactor: 2.5,
      interval: 1,
    });
    const expected = before + 6 * 24 * 60 * 60 * 1000;
    // Allow 5s tolerance for test execution time.
    expect(Math.abs(result.dueDate.getTime() - expected)).toBeLessThan(5000);
  });
});
