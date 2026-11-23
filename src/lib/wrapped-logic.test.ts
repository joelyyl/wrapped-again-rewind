import { describe, expect, it } from "vitest";
import { buildOptions, daysKnown, flameLevel, messageChange } from "./wrapped-logic";

describe("wrapped quiz options", () => {
  it("puts the real message count at option C", () => {
    const opts = buildOptions(23309, 2, "abc");
    expect(opts[2]).toBe(23309);
    expect(new Set(opts).size).toBe(4);
  });
  it("keeps wrong message options close (within 12%)", () => {
    for (const v of buildOptions(23309, 2, "abc")) expect(Math.abs(v - 23309)).toBeLessThanOrEqual(23309 * 0.12 + 1);
  });
  it("puts the real gaming hours at option B", () => {
    expect(buildOptions(120, 1, "x")[1]).toBe(120);
  });
});

describe("streak flame", () => {
  it("changes colour at 1, 5, 10 and 15 days", () => {
    expect(flameLevel(0)).toBe("unlit");
    expect(flameLevel(1)).toBe("fire");
    expect(flameLevel(5)).toBe("purple");
    expect(flameLevel(10)).toBe("diamond");
    expect(flameLevel(15)).toBe("emerald");
  });
});

describe("stats", () => {
  it("computes % more than 2025", () => {
    expect(messageChange(15000, 10000)).toEqual({ percent: 50, direction: "more" });
    expect(messageChange(5000, 10000)).toEqual({ percent: 50, direction: "less" });
  });
  it("counts days known", () => {
    expect(daysKnown("2026-01-01", new Date("2026-01-11T12:00:00Z"))).toBe(10);
  });
});
