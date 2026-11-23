import { describe, expect, it } from "vitest";
import { adminRedirect } from "./admin-flow";

describe("adminRedirect", () => {
  it("sends signed-out visitors to sign in, remembering where they wanted to go", () => {
    expect(adminRedirect("/admin", "", "signed-out")).toBe("/admin/giris");
    expect(adminRedirect("/admin/hizmetler", "?id=3", "signed-out")).toBe(
      "/admin/giris?next=%2Fadmin%2Fhizmetler%3Fid%3D3",
    );
    expect(adminRedirect("/admin/dogrulama", "", "signed-out")).toBe(
      "/admin/giris?next=%2Fadmin%2Fdogrulama",
    );
  });

  it("lets signed-out visitors reach sign-in, forgot password and the email link", () => {
    expect(adminRedirect("/admin/giris", "", "signed-out")).toBeNull();
    expect(adminRedirect("/admin/sifremi-unuttum", "", "signed-out")).toBeNull();
    expect(adminRedirect("/admin/auth/confirm", "?token_hash=x", "signed-out")).toBeNull();
  });

  it("makes a password-only session without a 2FA app set one up first", () => {
    expect(adminRedirect("/admin", "", "needs-setup")).toBe("/admin/dogrulama-kurulumu");
    expect(adminRedirect("/admin/sifre-yenile", "", "needs-setup")).toBe(
      "/admin/dogrulama-kurulumu?next=%2Fadmin%2Fsifre-yenile",
    );
    expect(adminRedirect("/admin/giris", "", "needs-setup")).toBe("/admin/dogrulama-kurulumu");
    expect(adminRedirect("/admin/dogrulama-kurulumu", "", "needs-setup")).toBeNull();
    expect(adminRedirect("/admin/auth/cikis", "", "needs-setup")).toBeNull();
  });

  it("asks a password-only session for the 2FA code before anything else", () => {
    expect(adminRedirect("/admin/hesap", "", "needs-code")).toBe(
      "/admin/dogrulama?next=%2Fadmin%2Fhesap",
    );
    expect(adminRedirect("/admin/sifre-yenile", "", "needs-code")).toBe(
      "/admin/dogrulama?next=%2Fadmin%2Fsifre-yenile",
    );
    expect(adminRedirect("/admin/giris", "", "needs-code")).toBe("/admin/dogrulama");
    expect(adminRedirect("/admin/dogrulama-kurulumu", "", "needs-code")).toBe("/admin/dogrulama");
    expect(adminRedirect("/admin/dogrulama", "", "needs-code")).toBeNull();
    expect(adminRedirect("/admin/auth/confirm", "", "needs-code")).toBeNull();
  });

  it("keeps signed-in admins out of the sign-in steps", () => {
    expect(adminRedirect("/admin/giris", "", "signed-in")).toBe("/admin");
    expect(adminRedirect("/admin/dogrulama", "", "signed-in")).toBe("/admin");
    expect(adminRedirect("/admin/dogrulama-kurulumu", "", "signed-in")).toBe("/admin");
    expect(adminRedirect("/admin", "", "signed-in")).toBeNull();
    expect(adminRedirect("/admin/auth/cikis", "", "signed-in")).toBeNull();
    expect(adminRedirect("/admin/sifre-yenile", "", "signed-in")).toBeNull();
  });
});
