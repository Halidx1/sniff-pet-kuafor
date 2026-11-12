import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { stubMapTiles } from "./map-stub";

test.beforeEach(({ page }) => stubMapTiles(page));

const PAGES = [
  { path: "/", h1: "Küçük Dostlarınız, Büyük Bir Özeni Hak Ediyor!" },
  { path: "/hizmetlerimiz", h1: "Hizmetlerimiz" },
  { path: "/fiyatlarimiz", h1: "Bakım Hizmetlerimiz ve Fiyatlarımız" },
  { path: "/hakkimizda", h1: "Hakkımızda" },
  { path: "/galeri", h1: "Galeri" },
  { path: "/sss", h1: "Sıkça Sorulan Sorular" },
  { path: "/iletisim", h1: "İletişim" },
  { path: "/randevu-al", h1: "Randevu Al" },
  { path: "/kvkk", h1: "KVKK Aydınlatma Metni" },
];

for (const { path, h1 } of PAGES) {
  test(`${path}: Turkish, one h1, no WCAG A/AA violations`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("no page scrolls sideways at 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const { path } of PAGES) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

// With the seed, every service, price, add-on and FAQ answer is an unpublished demo
// draft: none of it may appear, and the exact SPEC fallback texts must (SPEC §9, §10, §15).
test("demo drafts never leak to the public site", async ({ page }) => {
  const demoTexts = [
    "Banyo ve Kurulama",
    "Tıraş ve Tüy Bakımı",
    "Tarama ve Düğüm Açma",
    "Tırnak Bakımı",
    "Kulak ve Göz Çevresi Temizliği",
    "Komple Bakım",
    "Pati Bakımı",
    "DEMO",
    "başlayan",
  ];
  for (const path of ["/", "/hizmetlerimiz", "/fiyatlarimiz", "/sss"]) {
    await page.goto(path);
    const text = await page.locator("main").innerText();
    for (const demo of demoTexts) expect(text, `${path} shows "${demo}"`).not.toContain(demo);
    expect(text, `${path} shows a price`).not.toMatch(/₺\s?\d/);
  }

  await page.goto("/hizmetlerimiz");
  await expect(
    page.getByText(
      "Size ve minik dostunuza en uygun bakım seçenekleri hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.",
    ),
  ).toBeVisible();

  await page.goto("/fiyatlarimiz");
  await expect(
    page.getByText("Bakım fiyatlarımız; dostumuzun ırkına, boyutuna", { exact: false }),
  ).toBeVisible();
  // No WhatsApp number in the seed, so "Fiyat Bilgisi Al" falls back to the contact page.
  await expect(page.getByRole("link", { name: "Fiyat Bilgisi Al" })).toHaveAttribute(
    "href",
    "/iletisim",
  );
});

test("contact details show only what is set", async ({ page }) => {
  await page.goto("/iletisim");
  const main = page.locator("main");
  await expect(main.getByText("Gaziosmanpaşa Mahallesi", { exact: false })).toBeVisible();
  await expect(main.getByRole("link", { name: /@sniffpetkuafor/ })).toHaveAttribute(
    "href",
    "https://www.instagram.com/sniffpetkuafor/",
  );
  // Phone, WhatsApp and opening hours aren't in the seed: nothing is invented.
  await expect(page.locator('a[href^="tel:"], a[href*="wa.me"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Çalışma saatleri" })).toHaveCount(0);
});

test("the map shows the shop's pin and no third-party frame", async ({ page }) => {
  await page.goto("/iletisim");
  const map = page.locator("main [data-map-status]");
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute("data-map-status", "ready");
  await expect(
    page.getByRole("region", { name: "Sniff Pet Kuaför'ün haritadaki konumu" }),
  ).toBeVisible();
  // Visible = non-zero size: MapLibre's CSS once collapsed the canvas to 0 px high.
  await expect(map.locator("canvas")).toBeVisible();
  await expect(map.locator(".maplibregl-marker")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("the map engine loads only when the map scrolls into view", async ({ page }) => {
  const styleRequests: string[] = [];
  page.on("request", (r) => r.url().includes("openfreemap") && styleRequests.push(r.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(styleRequests).toEqual([]);
  await page.locator("main [data-map-status]").scrollIntoViewIfNeeded();
  await expect(page.locator("main [data-map-status]")).toHaveAttribute("data-map-status", "ready");
});

test("skip link moves keyboard focus to the content", async ({ page }) => {
  await page.goto("/hakkimizda");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "İçeriğe geç" });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("mobile menu opens, closes with Escape and returns focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the hamburger menu is mobile-only");
  await page.goto("/");
  const open = page.getByRole("button", { name: "Menüyü aç" });
  await open.click();
  const menu = page.getByRole("dialog", { name: "Menü" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(open).toBeFocused();

  await open.click();
  await menu.getByRole("link", { name: "Galeri" }).click();
  await expect(page).toHaveURL("/galeri");
  await expect(menu).toBeHidden();
});

test("gallery filters by pet and browses photos in a lightbox", async ({ page }) => {
  await page.goto("/galeri");
  const thumbs = page.getByRole("button", { name: /^Fotoğrafı büyüt/ });
  await expect(thumbs).toHaveCount(2);

  await page.getByRole("button", { name: "Kedi", exact: true }).click();
  await expect(thumbs).toHaveCount(1);
  await page.getByRole("button", { name: "Tümü" }).click();
  await expect(thumbs).toHaveCount(2);

  await thumbs.first().click();
  const lightbox = page.getByRole("dialog", { name: "Fotoğraf" });
  await expect(lightbox).toBeVisible();
  const firstAlt = await lightbox.locator("img").getAttribute("alt");
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.locator("img")).not.toHaveAttribute("alt", firstAlt ?? "");
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
  await expect(thumbs.first()).toBeFocused();
});

test("the map opens directions: the device's maps app on phones, Google Maps on desktop", async ({
  page,
  isMobile,
}) => {
  // Record window.open calls instead of opening real tabs.
  await page.addInitScript(() => {
    (window as unknown as { opened: string[] }).opened = [];
    window.open = (url?: string | URL) => {
      (window as unknown as { opened: string[] }).opened.push(String(url));
      return null;
    };
  });
  await page.goto("/iletisim");
  const map = page.locator("main [data-map-status]");
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute("data-map-status", "ready");

  // The licence info starts collapsed (one tap away behind the "i" button).
  await expect(map.locator(".maplibregl-ctrl-attrib")).not.toHaveClass(/maplibregl-compact-show/);

  // Pixel 7 (the mobile project) is Android → geo: link; desktop → the owner's Google link.
  const expected = isMobile ? /^geo:39\.797668,32\.802474\?q=/ : /^https:\/\/maps\.app\.goo\.gl\//;
  await expect(page.getByRole("link", { name: "Yol Tarifi Al", exact: true })).toHaveAttribute(
    "href",
    expected,
  );
  await expect(
    page.getByRole("link", { name: "Sniff Pet Kuaför'e yol tarifi al" }),
  ).toHaveAttribute("href", expected);

  if (!isMobile) {
    await map.locator("canvas").click({ position: { x: 40, y: 200 } });
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { opened: string[] }).opened))
      .toEqual(["https://maps.app.goo.gl/ipSQ9QxkoMe3rBi49"]);
  }
});
