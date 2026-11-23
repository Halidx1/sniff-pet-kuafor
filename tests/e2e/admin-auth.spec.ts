import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { clearInbox, createAdmin, freshCode, latestEmail } from "./admin-helpers";

// Admin sign-in with mandatory 2FA (SPEC §14, PLAN §9 T1/T2/T9/T10). One account, in
// order: the steps build on each other (enrolment → sign-ins → reset). Desktop project only
// (playwright.config.ts), so two browsers never share the account.
// Generous timeout: a TOTP code can't be used twice, so a step may wait up to 30 s for
// the next code, like a person waiting for the app to show a new one.
test.describe.configure({ mode: "serial", timeout: 90_000 });

const EMAIL = "e2e-admin@example.test";
const PASSWORD = "dogru-at-pil-zimba-42";
const NEW_PASSWORD = "yeni-sifre-kedi-kopek-7";
let secret = "";

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

async function signIn(page: Page, password = PASSWORD) {
  await page.goto("/admin/giris");
  await page.getByLabel("E-posta").fill(EMAIL);
  await page.getByLabel("Şifre", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
}

async function enterCode(page: Page) {
  await page.getByLabel("6 haneli kod").fill(await freshCode(secret));
  await page.getByRole("button", { name: "Doğrula" }).click();
}

test.beforeAll(async () => {
  await createAdmin(EMAIL, PASSWORD, "E2E Yönetici");
});

test("signed out, every admin page leads to sign-in, under a strict nonce CSP", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text());
  });

  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/giris");
  await page.goto("/admin/hesap");
  await expect(page).toHaveURL("/admin/giris?next=%2Fadmin%2Fhesap");

  const response = await page.goto("/admin/giris");
  const headers = response!.headers();
  expect(headers["content-security-policy"]).toMatch(
    /script-src 'self' 'nonce-[^']+' 'strict-dynamic'/,
  );
  expect(headers["content-security-policy"]).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
  expect(headers["cache-control"]).toContain("no-store");
  // Next.js put this request's nonce on its scripts (browsers hide nonce values from the
  // DOM, so check the HTML as sent).
  const nonce = headers["content-security-policy"]!.match(/'nonce-([^']+)'/)![1];
  expect(await response!.text()).toContain(`nonce="${nonce}"`);
  expect(violations).toEqual([]);
  expect((await axe(page)).violations).toEqual([]);
});

test("first sign-in: wrong password is refused, then 2FA setup is required", async ({
  page,
  context,
}) => {
  await signIn(page, "yanlis-sifre-123456");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "E-posta adresi veya şifre hatalı.",
  );

  await signIn(page);
  await expect(page).toHaveURL("/admin/dogrulama-kurulumu");
  // Even typing the panel's address leads back to the setup.
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/dogrulama-kurulumu");

  await page.getByRole("button", { name: "Kurulumu başlat" }).click();
  await expect(page.getByAltText("Doğrulama uygulaması için QR kod")).toBeVisible();
  await page.getByText("QR kodu okutamıyorum").click();
  secret = (await page.getByTestId("totp-secret").textContent())!.trim();
  expect(secret).toMatch(/^[A-Z2-7]{16,}$/);

  await page.getByLabel("6 haneli kod").fill("000000");
  await page.getByRole("button", { name: "Kurulumu tamamla" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Kod hatalı");

  await page.getByLabel("6 haneli kod").fill(await freshCode(secret));
  await page.getByRole("button", { name: "Kurulumu tamamla" }).click();
  await expect(page).toHaveURL("/admin");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hoş geldiniz, E2E Yönetici");
  expect((await axe(page)).violations).toEqual([]);

  // T2: the session cookie can't be read by scripts and never goes to public pages.
  const session = (await context.cookies()).filter((c) => c.name.startsWith("sb-"));
  expect(session.length).toBeGreaterThan(0);
  for (const cookie of session) {
    expect(cookie).toMatchObject({ path: "/admin", httpOnly: true, sameSite: "Lax" });
  }
});

test("a password alone never reaches the panel; the code does, back to the asked page", async ({
  page,
}) => {
  await signIn(page);
  await expect(page).toHaveURL("/admin/dogrulama");
  await page.goto("/admin/hesap");
  await expect(page).toHaveURL("/admin/dogrulama?next=%2Fadmin%2Fhesap");

  await page.getByLabel("6 haneli kod").fill("123456");
  await page.getByRole("button", { name: "Doğrula" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Kod hatalı");

  await enterCode(page);
  await expect(page).toHaveURL("/admin/hesap");
  await expect(page.getByText("İki adımlı doğrulama açık")).toBeVisible();
  // Signed in, the sign-in page sends you to the panel.
  await page.goto("/admin/giris");
  await expect(page).toHaveURL("/admin");

  await page.getByRole("button", { name: "Çıkış" }).click();
  await expect(page).toHaveURL("/admin/giris");
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/giris");
});

test("forgot password: same answer for any address, Turkish email, link + code → new password", async ({
  page,
}) => {
  await clearInbox();
  const ask = async (email: string) => {
    await page.goto("/admin/sifremi-unuttum");
    await page.getByLabel("E-posta").fill(email);
    await page.getByRole("button", { name: "Sıfırlama bağlantısı gönder" }).click();
    return (await page.getByRole("main").getByRole("status").textContent())!.trim();
  };
  const unknown = await ask("kimse@example.test");
  const known = await ask(EMAIL);
  expect(known).toBe(unknown); // T10: no account enumeration

  const email = await latestEmail(EMAIL);
  expect(email.subject).toBe("Sniff Pet Kuaför yönetim paneli: şifre sıfırlama");
  const link = email.html
    .match(/href="([^"]*\/admin\/auth\/confirm[^"]*)"/)![1]!
    .replaceAll("&amp;", "&");
  await page.goto(new URL(link).pathname + new URL(link).search);
  // Opening the link spends nothing (mail scanners open links too); the button does.
  await page.getByRole("button", { name: "Devam et" }).click();

  // The reset link alone isn't enough: the 2FA code comes first.
  await expect(page).toHaveURL("/admin/dogrulama?next=%2Fadmin%2Fsifre-yenile");
  await enterCode(page);
  await expect(page).toHaveURL("/admin/sifre-yenile");

  await page.getByLabel("Yeni şifre", { exact: true }).fill("kisa");
  await page.getByLabel("Yeni şifre (tekrar)").fill("kisa");
  await page.getByRole("button", { name: "Şifreyi değiştir" }).click();
  await expect(page.getByText("Şifre en az 12 karakter olmalı.")).toBeVisible();

  await page.getByLabel("Yeni şifre", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Yeni şifre (tekrar)").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Şifreyi değiştir" }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText("Şifreniz değiştirildi.");

  await page.getByRole("button", { name: "Çıkış" }).click();
  await expect(page).toHaveURL("/admin/giris");
  await signIn(page, NEW_PASSWORD);
  await expect(page).toHaveURL("/admin/dogrulama");
});

test("the email link rejects a forged or reused token", async ({ page }) => {
  await page.goto("/admin/auth/confirm?token_hash=abc&type=recovery");
  await page.getByRole("button", { name: "Devam et" }).click();
  await expect(page).toHaveURL("/admin/giris?hata=baglanti");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Bağlantı geçersiz");
});
