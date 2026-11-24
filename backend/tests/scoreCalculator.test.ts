/**
 * Score calculator tests — verifies the generic engine produces
 * correctly-scaled scores for all 7 exam types (Section 2 table).
 */
import {
  calculateScore,
  percentageToScaledScore,
  satRawToScaled,
} from "../src/services/scoreCalculator";

describe("percentageToScaledScore — all 7 exam types", () => {
  it("IELTS: 0-9 in 0.5 steps", () => {
    expect(percentageToScaledScore("IELTS", 0)).toBe(0);
    expect(percentageToScaledScore("IELTS", 1)).toBe(9);
    expect(percentageToScaledScore("IELTS", 0.5)).toBe(4.5);
  });

  it("GRE: 130-170", () => {
    expect(percentageToScaledScore("GRE", 0)).toBe(130);
    expect(percentageToScaledScore("GRE", 1)).toBe(170);
    expect(percentageToScaledScore("GRE", 0.5)).toBe(150);
  });

  it("TOEFL: 0-30 per section", () => {
    expect(percentageToScaledScore("TOEFL", 0)).toBe(0);
    expect(percentageToScaledScore("TOEFL", 1)).toBe(30);
  });

  it("PTE: 10-90", () => {
    expect(percentageToScaledScore("PTE", 0)).toBe(10);
    expect(percentageToScaledScore("PTE", 1)).toBe(90);
  });

  it("DET: 10-160 in increments of 5", () => {
    expect(percentageToScaledScore("DET", 0)).toBe(10);
    expect(percentageToScaledScore("DET", 1)).toBe(160);
    expect(percentageToScaledScore("DET", 0.5)).toBe(85);
  });

  it("CAE: 142-210", () => {
    expect(percentageToScaledScore("CAE", 0)).toBe(142);
    expect(percentageToScaledScore("CAE", 1)).toBe(210);
  });

  it("CPE: 180-230", () => {
    expect(percentageToScaledScore("CPE", 0)).toBe(180);
    expect(percentageToScaledScore("CPE", 1)).toBe(230);
  });

  it("clamps percentage to 0..1", () => {
    expect(percentageToScaledScore("IELTS", 2)).toBe(9);
    expect(percentageToScaledScore("IELTS", -1)).toBe(0);
  });
});

describe("SAT raw-to-scaled lookup table", () => {
  it("maps raw counts to 200-800", () => {
    expect(satRawToScaled(0)).toBe(200);
    expect(satRawToScaled(10)).toBe(470);
    expect(satRawToScaled(20)).toBe(800);
    expect(satRawToScaled(99)).toBe(800);
  });

  it("calculateScore uses the SAT table on raw count", () => {
    const result = calculateScore("SAT", 10, 20, 0);
    expect(result.scaledScore).toBe(470);
    expect(result.rawScore).toBe(10);
    expect(result.maxScore).toBe(20);
  });
});

describe("calculateScore", () => {
  it("computes percentage and pending review count", () => {
    const result = calculateScore("IELTS", 3, 4, 1);
    expect(result.percentage).toBeCloseTo(0.75, 10);
    expect(result.pendingReview).toBe(1);
    expect(result.scale).toContain("IELTS");
  });

  it("handles zero auto-scorable questions without dividing by zero", () => {
    const result = calculateScore("GRE", 0, 0, 2);
    expect(result.percentage).toBe(0);
    expect(result.scaledScore).toBe(130);
  });
});
