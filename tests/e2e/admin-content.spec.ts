import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createAdminWith2fa, localSql } from "./admin-helpers";
import { signInAsAdmin } from "./admin-helpers-page";

// İşletme Bilgileri and Metinler (SPEC §14): an admin edit reaches the public site
// within seconds (updateTag). Only fields no other test depends on are changed, and
// they're put back afterwards.
test.describe.configure({ mode: "serial", timeout: 90_000 });

const EMAIL = "e2e-editor@example.test";
const PASSWORD = "editor-sifre-pati-2026";
let secret = "";
let originalAbout = "";

test.beforeAll(async () => {
  secret = await createAdminWith2fa(EMAIL, PASSWORD, "E2E Editör");
  originalAbout = await localSql(
    async (sql) => (await sql`select about_markdown from public.site_texts`)[0]!.about_markdown,
  );
});

test.afterAll(async () => {
  await localSql(async (sql) => {
    await sql`update public.business_profile set email = null`;
    await sql`update public.site_texts set about_markdown = ${originalAbout}`;
  });
});

test("İşletme Bilgileri: invalid input is explained and kept; a saved email shows on the site", async ({
  page,
}) => {
  await signInAsAdmin(page, EMAIL, PASSWORD, secret);
  await page.getByRole("link", { name: "İşletme Bilgileri" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("İşletme Bilgileri");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.getByLabel("Telefon").fill("123");
  await page.getByLabel("E-posta").fill("bilgi@example.test");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByText("Geçerli bir telefon numarası girin")).toBeVisible();
  // What was typed is still there, nothing was saved.
  await expect(page.getByLabel("E-posta")).toHaveValue("bilgi@example.test");

  await page.getByLabel("Telefon").fill("");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText("Kaydedildi");

  await page.goto("/iletisim");
  await expect(
    page.getByRole("main").getByRole("link", { name: "bilgi@example.test" }),
  ).toHaveAttribute("href", "mailto:bilgi@example.test");
});

test("Metinler: a new About text is live on /hakkimizda", async ({ page }) => {
  await signInAsAdmin(page, EMAIL, PASSWORD, secret);
  await page.goto("/admin/metinler");
  await page
    .getByLabel("Hakkımızda metni")
    .fill("## Test başlığı\n\nE2E ile yazılmış hakkımızda metni.");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText("Kaydedildi");

  await page.goto("/hakkimizda");
  await expect(page.getByRole("heading", { level: 2, name: "Test başlığı" })).toBeVisible();
  await expect(page.getByText("E2E ile yazılmış hakkımızda metni.")).toBeVisible();
});
