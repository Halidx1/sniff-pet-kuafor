import { describe, expect, it } from "vitest";
import { safeAdminNext } from "./safe-next";

describe("safeAdminNext", () => {
  it("keeps relative admin paths, with simple query strings", () => {
    expect(safeAdminNext("/admin")).toBe("/admin");
    expect(safeAdminNext("/admin/hizmetler")).toBe("/admin/hizmetler");
    expect(safeAdminNext("/admin/galeri?tur=gallery")).toBe("/admin/galeri?tur=gallery");
    expect(safeAdminNext("/admin/sifre-yenile")).toBe("/admin/sifre-yenile");
  });

  it("rejects other sites, protocol-relative and look-alike paths", () => {
    for (const bad of [
      "https://evil.example/admin",
      "//evil.example",
      "/admin//evil.example",
      "/administrator",
      "/adminx/y",
      "/",
      "javascript:alert(1)",
      "/admin/<script>",
      "/admin?next=https://evil.example",
      "",
    ]) {
      expect(safeAdminNext(bad), bad).toBe("/admin");
    }
  });

  it("never sends back into the sign-in steps", () => {
    expect(safeAdminNext("/admin/giris")).toBe("/admin");
    expect(safeAdminNext("/admin/dogrulama?next=/admin")).toBe("/admin");
    expect(safeAdminNext("/admin/dogrulama-kurulumu")).toBe("/admin");
    expect(safeAdminNext("/admin/auth/confirm")).toBe("/admin");
  });

  it("falls back for anything that isn't a string", () => {
    expect(safeAdminNext(undefined)).toBe("/admin");
    expect(safeAdminNext(null)).toBe("/admin");
    expect(safeAdminNext(["/admin/hesap"])).toBe("/admin");
  });
});
