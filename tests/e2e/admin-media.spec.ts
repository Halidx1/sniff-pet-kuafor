import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createAdminWith2fa, localSql } from "./admin-helpers";
import { signInAsAdmin } from "./admin-helpers-page";

// Fotoğraflar (SPEC §14.5, issue #32): upload resized in the browser, publish, edit,
// group, reorder and delete, with the public gallery following each step.
// One test (a TOTP code can't be reused, so every sign-in waits for a new one).
test.describe.configure({ mode: "serial", timeout: 180_000 });

const EMAIL = "e2e-media@example.test";
const PASSWORD = "medya-sifre-pati-2026";
const PHOTO_A = "supabase/seed/media/shop/cocker-spaniel-before.jpg";
const PHOTO_B = "supabase/seed/media/shop/cocker-spaniel-after.jpg";
// Unique per run: cleanup goes through SQL, which can't refresh the site's cached
// pages, so a failed earlier run may still show its photos there.
const RUN = Date.now().toString(36);
const ALT_A = `E2E köpek önce ${RUN}`;
const ALT_B = `E2E köpek sonra ${RUN}`;
let secret = "";

const cleanUp = () => localSql((sql) => sql`delete from public.media where alt_text like 'E2E%'`);

test.beforeAll(async () => {
  secret = await createAdminWith2fa(EMAIL, PASSWORD, "E2E Medya");
  await cleanUp();
});
test.afterAll(cleanUp);

/** The card (list item) that holds the photo described as `alt`. */
const cardOf = (page: Page, alt: string) =>
  page
    .getByRole("listitem")
    .filter({ hasText: `Açıklama: ${alt}` })
    .filter({
      has: page.getByRole("heading", { level: 3 }),
    });

const uploader = (page: Page) => page.getByRole("region", { name: "Fotoğraf yükle" });

async function upload(page: Page, file: string, alt: string) {
  const box = uploader(page);
  await box.getByLabel("Fotoğraf seçin").setInputFiles(file);
  await box.getByLabel("Fotoğraf 1: ne görünüyor?").fill(alt);
  await box.getByLabel("Kedi mi, köpek mi?").selectOption("dog");
  await box.getByRole("button", { name: "Fotoğrafı yükle" }).click();
  await expect(page.getByText("1 fotoğraf yüklendi")).toBeVisible({ timeout: 30_000 });
  await expect(cardOf(page, alt)).toBeVisible();
}

test("Fotoğraflar: upload, publish, group, reorder, edit and delete", async ({ page }) => {
  await signInAsAdmin(page, EMAIL, PASSWORD, secret);
  await page.getByRole("link", { name: "Fotoğraflar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fotoğraflar");

  // Alt text is required before anything is uploaded.
  await uploader(page).getByLabel("Fotoğraf seçin").setInputFiles(PHOTO_A);
  await uploader(page).getByRole("button", { name: "Fotoğrafı yükle" }).click();
  await expect(uploader(page).getByText("Fotoğrafta ne olduğunu kısaca yazın.")).toBeVisible();
  await uploader(page).getByRole("button", { name: "Listeden çıkar" }).click();

  await upload(page, PHOTO_A, ALT_A);
  await upload(page, PHOTO_B, ALT_B);
  const [row] = await localSql(
    (sql) =>
      sql`select storage_prefix, widths, file_ext, is_published, width from public.media where alt_text = ${ALT_A}`,
  );
  expect(row).toMatchObject({ file_ext: "webp", is_published: false });
  expect(row!.widths.length).toBeGreaterThan(0);
  expect(row!.width).toBeLessThanOrEqual(1600);

  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  // New photos are hidden: not on the site yet.
  await page.goto("/galeri");
  await expect(page.getByRole("button", { name: `Fotoğrafı büyüt: ${ALT_A}` })).toHaveCount(0);

  // Group the two as a before/after card: the upper one (B, uploaded last) is "Önce".
  await page.goto("/admin/fotograflar");
  await cardOf(page, ALT_B)
    .getByLabel(/Birleştirmek için seç/)
    .check();
  await cardOf(page, ALT_A)
    .getByLabel(/Birleştirmek için seç/)
    .check();
  await page.getByRole("button", { name: "Önce / Sonra kartı yap" }).click();
  const pair = cardOf(page, ALT_A);
  await expect(pair.getByRole("heading", { level: 3 })).toContainText("Önce / Sonra kartı");
  await expect(pair).toContainText(ALT_B);

  await pair.getByRole("button", { name: /yayınla/ }).click();
  await expect(cardOf(page, ALT_A).getByText("Yayında", { exact: true })).toBeVisible();

  await page.goto("/galeri");
  await expect(page.getByRole("button", { name: `Fotoğrafı büyüt: ${ALT_B}` })).toBeVisible();

  // Move the card down one place and back.
  await page.goto("/admin/fotograflar");
  const heading = () => cardOf(page, ALT_A).getByRole("heading", { level: 3 });
  await expect(heading()).toHaveText(/^1\./);
  await cardOf(page, ALT_A)
    .getByRole("button", { name: /aşağı taşı/ })
    .click();
  await expect(heading()).toHaveText(/^2\./);
  await cardOf(page, ALT_A)
    .getByRole("button", { name: /yukarı taşı/ })
    .click();
  await expect(heading()).toHaveText(/^1\./);

  // Edit a description.
  const editA = page.locator("details", { has: page.getByText(`Düzenle: ${ALT_A}`) });
  await editA.getByText(`Düzenle: ${ALT_A}`).click();
  await editA.getByLabel("Fotoğrafta ne görünüyor?").fill(`${ALT_A} (düzenlendi)`);
  await editA.getByRole("button", { name: "Kaydet" }).click();
  await expect(editA.getByRole("status")).toContainText("Kaydedildi");

  // Separate, then delete both: files go too.
  await page.reload();
  await cardOf(page, ALT_B)
    .getByRole("button", { name: /fotoğrafları ayır/ })
    .click();
  await expect(cardOf(page, ALT_B).getByRole("heading", { level: 3 })).toHaveText(
    /^\d+\. Fotoğraf$/,
  );
  for (const alt of [ALT_B, `${ALT_A} (düzenlendi)`]) {
    const remove = page.locator("details", { has: page.getByText(`Sil: ${alt}`) });
    await remove.getByText(`Sil: ${alt}`).click();
    await remove.getByRole("button", { name: "Evet, kalıcı olarak sil" }).click();
    await expect(cardOf(page, alt)).toHaveCount(0);
  }
  const files = await localSql(
    (sql) =>
      sql`select count(*)::int as n from storage.objects where bucket_id = 'media' and name like ${row!.storage_prefix + "/%"}`,
  );
  expect(files[0]!.n).toBe(0);

  await page.goto("/galeri");
  await expect(page.getByRole("button", { name: `Fotoğrafı büyüt: ${ALT_B}` })).toHaveCount(0);
});
