import { getApiErrorMessage } from "../lib/api";

describe("getApiErrorMessage", () => {
  it("returns Error.message for standard Error", () => {
    expect(getApiErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("returns fallback for unknown error", () => {
    expect(getApiErrorMessage("oops", "Fallback msg")).toBe("Fallback msg");
  });
});
