import { describe, expect, it, vi } from "vitest";
import { buildSuggestions, calculateQuality } from "./scoring";

describe("repository quality", () => {
  it("returns a perfect score for a complete active repository", () => {
    vi.setSystemTime(new Date("2026-07-20T00:00:00Z"));
    expect(calculateQuality({ hasReadme: true, hasTests: true, hasLicense: true, hasActions: true, updatedAt: "2026-07-19T00:00:00Z" }).total).toBe(100);
    vi.useRealTimers();
  });

  it("creates focused suggestions for missing quality signals", () => {
    expect(buildSuggestions({ hasReadme: false, hasTests: true, hasLicense: false, hasActions: true, updatedAt: new Date().toISOString() })).toEqual(["readme", "license"]);
  });
});
