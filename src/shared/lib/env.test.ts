import { afterEach, describe, expect, it, vi } from "vitest";
import { requiredEnv } from "./env";

describe("requiredEnv", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns the value when set", () => {
    vi.stubEnv("SOME_TEST_VAR", "value");
    expect(requiredEnv("SOME_TEST_VAR")).toBe("value");
  });

  it("throws a clear error when missing or empty", () => {
    vi.stubEnv("SOME_TEST_VAR", "");
    expect(() => requiredEnv("SOME_TEST_VAR")).toThrow(
      "Missing environment variable SOME_TEST_VAR",
    );
  });
});
