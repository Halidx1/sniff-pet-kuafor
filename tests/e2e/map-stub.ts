import type { Page } from "@playwright/test";

/**
 * Answers OpenFreeMap requests locally, so E2E never depends on a third-party server.
 * The style is a valid, empty one: MapLibre still mounts, draws the pin and its controls.
 */
export async function stubMapTiles(page: Page) {
  await page.route("https://tiles.openfreemap.org/**", (route) =>
    route.request().url().includes("/styles/")
      ? route.fulfill({
          json: {
            version: 8,
            sources: {},
            layers: [{ id: "background", type: "background" }],
          },
        })
      : route.fulfill({ status: 404 }),
  );
}
