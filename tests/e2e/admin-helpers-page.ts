import { expect, type Page } from "@playwright/test";
import { freshCode } from "./admin-helpers";

/** Signs in through the real pages: password, then the 2FA code. Ends on the panel. */
export async function signInAsAdmin(page: Page, email: string, password: string, secret: string) {
  await page.goto("/admin/giris");
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page).toHaveURL("/admin/dogrulama");
  await page.getByLabel("6 haneli kod").fill(await freshCode(secret));
  await page.getByRole("button", { name: "Doğrula" }).click();
  await expect(page).toHaveURL("/admin");
}
