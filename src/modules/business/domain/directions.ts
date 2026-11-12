// Pure rules for "take me there" links (SPEC §8). No I/O: the UI passes in what the
// browser reports, so the choice is easy to test.

export type Platform = "ios" | "android" | "desktop";

/**
 * iPhone and iPad (iPadOS reports a Mac user agent but has a touch screen), Android,
 * everything else counts as desktop.
 */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

type Place = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  /** The owner's Google Maps link (business settings). */
  mapsUrl: string | null;
};

/**
 * The link that opens directions to the shop:
 *  - iOS: Apple Maps (the system's maps app);
 *  - Android: a geo: link, which opens the default maps app (or asks which one);
 *  - desktop: the owner's Google Maps listing, or Google Maps directions.
 * Without coordinates, every platform falls back to the owner's link (or null).
 */
export function directionsUrl(place: Place, platform: Platform): string | null {
  const { latitude: lat, longitude: lng, mapsUrl, name } = place;
  if (lat === null || lng === null) return mapsUrl;
  const at = `${lat},${lng}`;
  if (platform === "ios") {
    return `https://maps.apple.com/?daddr=${at}&q=${encodeURIComponent(name)}`;
  }
  if (platform === "android") {
    return `geo:${at}?q=${at}(${encodeURIComponent(name)})`;
  }
  return mapsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${at}`;
}
