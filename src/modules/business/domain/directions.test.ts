import { describe, expect, it } from "vitest";
import { detectPlatform, directionsUrl } from "./directions";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15";
const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 16; Pixel 7) AppleWebKit/537.36 Chrome/150 Mobile";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150";

describe("detectPlatform", () => {
  it("recognises iPhone, iPad (desktop-class Safari with touch) and Android", () => {
    expect(detectPlatform(IPHONE)).toBe("ios");
    expect(detectPlatform(IPAD, 5)).toBe("ios");
    expect(detectPlatform(ANDROID)).toBe("android");
  });

  it("treats a Mac without touch and Windows as desktop", () => {
    expect(detectPlatform(IPAD, 0)).toBe("desktop");
    expect(detectPlatform(WINDOWS)).toBe("desktop");
  });
});

describe("directionsUrl", () => {
  const shop = {
    name: "Sniff Pet Kuaför",
    latitude: 39.797668,
    longitude: 32.802474,
    mapsUrl: "https://maps.app.goo.gl/ipSQ9QxkoMe3rBi49",
  };

  it("opens Apple Maps on iOS", () => {
    expect(directionsUrl(shop, "ios")).toBe(
      "https://maps.apple.com/?daddr=39.797668,32.802474&q=Sniff%20Pet%20Kuaf%C3%B6r",
    );
  });

  it("opens the default maps app on Android", () => {
    expect(directionsUrl(shop, "android")).toBe(
      "geo:39.797668,32.802474?q=39.797668,32.802474(Sniff%20Pet%20Kuaf%C3%B6r)",
    );
  });

  it("opens the owner's Google Maps listing on desktop", () => {
    expect(directionsUrl(shop, "desktop")).toBe(shop.mapsUrl);
  });

  it("falls back to Google Maps directions on desktop without an owner link", () => {
    expect(directionsUrl({ ...shop, mapsUrl: null }, "desktop")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=39.797668,32.802474",
    );
  });

  it("uses the owner's link (or nothing) when there are no coordinates", () => {
    const noPin = { ...shop, latitude: null, longitude: null };
    expect(directionsUrl(noPin, "ios")).toBe(shop.mapsUrl);
    expect(directionsUrl({ ...noPin, mapsUrl: null }, "android")).toBeNull();
  });
});
