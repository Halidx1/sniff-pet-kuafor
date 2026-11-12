"use client";

import { useSyncExternalStore } from "react";
import { detectPlatform, directionsUrl, type Platform } from "../domain/directions";

export type Place = Parameters<typeof directionsUrl>[0];

// The device never changes while the page is open, so there is nothing to subscribe to.
const subscribe = () => () => {};
const browserPlatform = () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
const serverPlatform = (): Platform => "desktop";

/**
 * The directions link for this visitor's device. The server (and hydration) uses the
 * desktop link, so the HTML is identical everywhere; right after hydration React swaps
 * in Apple Maps on iOS or the default maps app on Android.
 */
export function useDirections(place: Place): { url: string | null; platform: Platform } {
  const platform = useSyncExternalStore(subscribe, browserPlatform, serverPlatform);
  return { url: directionsUrl(place, platform), platform };
}
