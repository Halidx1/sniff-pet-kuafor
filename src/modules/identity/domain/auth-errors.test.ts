import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  it("never reveals whether the email or the password was wrong", () => {
    const wrongEmail = authErrorMessage({ code: "invalid_credentials", status: 400 }, "sign-in");
    const wrongPassword = authErrorMessage({ code: "invalid_credentials", status: 400 }, "sign-in");
    const unknown = authErrorMessage({ code: "user_not_found" }, "sign-in");
    expect(wrongEmail).toBe(wrongPassword);
    expect(unknown).toBe(wrongPassword);
    expect(wrongPassword).toBe("E-posta adresi veya şifre hatalı.");
  });

  it("explains rate limits and failed captchas in every step", () => {
    for (const step of ["sign-in", "code", "password"] as const) {
      expect(authErrorMessage({ status: 429 }, step)).toMatch(/Çok fazla deneme/);
      expect(authErrorMessage({ code: "over_request_rate_limit" }, step)).toMatch(/Çok fazla/);
      expect(authErrorMessage({ code: "captcha_failed" }, step)).toMatch(/Güvenlik doğrulaması/);
    }
  });

  it("has specific messages for codes and passwords", () => {
    expect(authErrorMessage({ code: "mfa_verification_failed" }, "code")).toMatch(/Kod hatalı/);
    expect(authErrorMessage({ code: "mfa_challenge_expired" }, "code")).toMatch(/süresi doldu/);
    expect(authErrorMessage({ code: "same_password" }, "password")).toMatch(/eskisiyle aynı/);
    expect(authErrorMessage({ code: "weak_password" }, "password")).toMatch(/zayıf/);
    expect(authErrorMessage(null, "password")).toMatch(/değiştirilemedi/);
    expect(authErrorMessage(undefined, "code")).toMatch(/Kod hatalı/);
  });
});
