import { describe, expect, it } from "vitest";
import { adminCsp } from "./proxy";

describe("adminCsp", () => {
  const csp = adminCsp("abc123", "https://x.supabase.co", false);

  it("allows scripts only with the nonce, no inline or eval", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toContain("'unsafe-eval'");
    expect(adminCsp("n", "", true)).toContain("'unsafe-eval'");
  });

  it("can't be framed and only talks to our own origins", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain(
      "connect-src 'self' https://x.supabase.co https://challenges.cloudflare.com",
    );
    expect(csp).toContain("object-src 'none'");
  });
});
