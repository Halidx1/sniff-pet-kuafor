import { describe, expect, it } from "vitest";
import { isValidWidths, planWidths, scaledHeight, variantNames } from "./upload-plan";

describe("planWidths", () => {
  it("makes all three sizes from a big phone photo", () => {
    expect(planWidths(4032)).toEqual([480, 960, 1600]);
  });
  it("never enlarges", () => {
    expect(planWidths(1200)).toEqual([480, 960]);
    expect(planWidths(960)).toEqual([480, 960]);
  });
  it("keeps a small photo at its own width", () => {
    expect(planWidths(400)).toEqual([400]);
  });
});

describe("scaledHeight", () => {
  it("keeps proportions", () => {
    expect(scaledHeight({ width: 4000, height: 3000 }, 480)).toBe(360);
    expect(scaledHeight({ width: 3, height: 1000 }, 1)).toBe(333);
  });
  it("is at least one pixel", () => {
    expect(scaledHeight({ width: 5000, height: 1 }, 480)).toBe(1);
  });
});

describe("isValidWidths", () => {
  it("accepts what planWidths makes", () => {
    expect(isValidWidths([480, 960, 1600])).toBe(true);
    expect(isValidWidths([480, 960])).toBe(true);
    expect(isValidWidths([480])).toBe(true);
    expect(isValidWidths([400])).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isValidWidths([])).toBe(false);
    expect(isValidWidths([960, 480])).toBe(false);
    expect(isValidWidths([480, 480])).toBe(false);
    expect(isValidWidths([960])).toBe(false);
    expect(isValidWidths([480, 1600])).toBe(false);
    expect(isValidWidths([300, 480])).toBe(false);
    expect(isValidWidths([100])).toBe(false);
    expect(isValidWidths([400.5])).toBe(false);
    expect(isValidWidths([480, 960, 1600, 2000])).toBe(false);
  });
});

describe("variantNames", () => {
  it("names one file per width", () => {
    expect(variantNames([480, 960], "jpg")).toEqual(["480.jpg", "960.jpg"]);
  });
});
