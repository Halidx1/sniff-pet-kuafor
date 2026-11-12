import { expect, test } from "@playwright/test";

test("security headers are set and previews are not indexable", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("frame-src 'none'");
  expect(csp).toContain("connect-src 'self' https://tiles.openfreemap.org");
  expect(csp).toContain("worker-src 'self'");
  expect(csp).toMatch(/img-src 'self' data: blob: http:\/\/127\.0\.0\.1:54321/);
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
  // SITE_INDEXABLE is only "true" on the production deploy.
  expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
});

test("health endpoint answers and is never cached", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("unknown pages get the Turkish 404", async ({ page }) => {
  const response = await page.goto("/boyle-bir-sayfa-yok");
  expect(response?.status()).toBe(404);
  // The 404 carries the same security headers as every other page.
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  await expect(
    page.getByRole("heading", { level: 1, name: "Aradığınız sayfa bulunamadı" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Anasayfaya dön" }).click();
  await expect(page).toHaveURL("/");
});
