import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { stubMapTiles } from "./map-stub";

/**
 * The story's GSAP timeline is built on the visitor's first interaction
 * (first-interaction.ts). Simulate one, then wait until the stage is pinned.
 */
async function armStory(page: Page) {
  // Repeat until it takes: an event before hydration has no listener yet.
  await expect
    .poll(async () => {
      await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
      return page.locator(".pin-spacer").count();
    })
    .toBeGreaterThan(0);
}

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
    // Let one-off page-load animations finish: half-faded text would count as low contrast.
    // Scroll-driven ones (the paw trail) follow the scroll position and never "finish".
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .filter((anim) => anim.timeline instanceof DocumentTimeline)
        .filter((anim) => anim.effect?.getTiming().iterations !== Infinity)
        .every((anim) => anim.playState === "finished"),
    );
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

test("gallery shows one card per post: Önce | Sonra pairs, a carousel, and a lightbox", async ({
  page,
}) => {
  await page.goto("/galeri");
  // Seed (supabase/seed/media/manifest.json): 9 before/after posts + 1 clothes carousel of 7.
  const cards = page.locator("main ul").first().locator("> li");
  await expect(cards).toHaveCount(10);
  const befores = page.getByRole("button", { name: /^Fotoğrafı büyüt: Bakım öncesi/ });
  const afters = page.getByRole("button", { name: /^Fotoğrafı büyüt: Bakım sonrası/ });
  await expect(befores).toHaveCount(9);
  await expect(afters).toHaveCount(9);
  // Only dogs in the seed → no Kedi/Köpek filter.
  await expect(page.getByRole("group", { name: "Fotoğrafları filtrele" })).toHaveCount(0);

  // The carousel scrolls sideways with its buttons.
  const next = page.getByRole("button", { name: "Sonraki fotoğraflar" });
  const track = next.locator("xpath=..").locator("> div").first();
  await next.scrollIntoViewIfNeeded();
  await next.click();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

  // The lightbox opens on the clicked photo; arrows browse into the cover collage.
  await befores.first().click();
  const lightbox = page.getByRole("dialog", { name: "Fotoğraf" });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator("img")).toHaveAttribute("alt", /^Bakım öncesi/);
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.locator("img")).toHaveAttribute("alt", /^Bakım sonrası/);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.locator("img")).toHaveAttribute("alt", /logosu altında/);
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
  await expect(befores.first()).toBeFocused();
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

// The hand-drawn grooming story (ADR-025).
test("hero texts and buttons are on the first screen", async ({ page }) => {
  await page.goto("/");
  // With normal motion settings there is nothing to switch on.
  await expect(page.locator(".hs-motion-toggle")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Hemen Randevu Al" })).toBeInViewport();
  await expect(page.locator(".hs-scene")).toHaveAttribute("aria-hidden", "true");
});

test("scrolling plays the story: the hero pins and the chapters change", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hs-cat")).toBeHidden();
  const pin = page.locator(".hs-pin");
  const startTop = await pin.evaluate((el) => el.getBoundingClientRect().top);
  // Halfway into the story: still pinned at the top, a caption is showing.
  // Wait for the story to set up its pin: scrolling earlier would make ScrollTrigger
  // keep the visitor's place and jump past the story.
  await armStory(page);
  await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
  await expect.poll(() => pin.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
  expect(startTop).toBeGreaterThan(0);
  await expect(page.locator(".hs-caption").filter({ visible: true })).toHaveCount(1);
  // Near the end: the cat has arrived.
  await page.evaluate(() => window.scrollTo(0, innerHeight * 4));
  await expect(page.locator(".hs-cat")).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a button plays the full animation from the top, remembered; and back", async ({ page }) => {
    const wordAnimating = () =>
      page
        .locator(".hs-word")
        .first()
        .evaluate((el) => el.getAnimations().some((anim) => anim.playState === "running"));
    await page.goto("/");
    await armStory(page);
    // Reduced motion: the headline is simply there.
    expect(await wordAnimating()).toBe(false);

    await page.evaluate(() => window.scrollTo(0, 300));
    await page.getByRole("button", { name: "Animasyonu tam hızda oynat" }).click();
    // Back to the beginning, with the headline animation.
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    await expect.poll(wordAnimating).toBe(true);

    // Full version: the dog's fur flies off (strands get a transform).
    await armStory(page);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 1.6));
    await expect
      .poll(() =>
        page
          .locator(".hs-strand")
          .first()
          .evaluate((el) => getComputedStyle(el).transform),
      )
      .not.toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

    await page.reload();
    const back = page.getByRole("button", { name: "Sade animasyona dön" });
    await expect(back).toBeVisible();

    // Switching back: from the top again, headline shown without animation.
    await back.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "full");
    await expect(page.getByRole("button", { name: "Animasyonu tam hızda oynat" })).toBeVisible();
    expect(await wordAnimating()).toBe(false);
  });

  test("the why-us points stand in the paw trail, fully visible without motion", async ({
    page,
  }) => {
    await page.goto("/");
    const paws = page.locator(".paw-trail > li");
    await expect(paws).toHaveCount(4);
    for (const paw of await paws.all()) {
      await paw.scrollIntoViewIfNeeded();
      await expect(paw.getByRole("heading", { level: 3 })).toBeVisible();
      expect(await paw.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
  });

  test("the story plays gently: it pins and reaches the cat, but nothing flies", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Wait for the story to set up its pin: scrolling earlier would make ScrollTrigger
    // keep the visitor's place and jump past the story.
    await armStory(page);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
    const pin = page.locator(".hs-pin");
    await expect
      .poll(() => pin.evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBe(0);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 4));
    await expect(page.locator(".hs-cat")).toBeVisible();
    // Fur faded instead of flying: no transform was ever applied to a strand.
    const transforms = await page
      .locator(".hs-strand")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
    expect(transforms.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
  });
});
