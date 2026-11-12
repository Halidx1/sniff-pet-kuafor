"use client";

import { ButtonLink } from "@/shared/ui/button";
import { useDirections, type Place } from "./use-directions";

/**
 * "Yol Tarifi Al": opens directions in the phone's maps app (Apple Maps on iOS, the
 * default app on Android) or the owner's Google Maps listing on a computer.
 * Renders nothing when there is neither a map pin nor an owner link.
 */
export function DirectionsLink({ place, className }: { place: Place; className?: string }) {
  const { url } = useDirections(place);
  if (!url) return null;
  return (
    <ButtonLink href={url} className={className}>
      Yol Tarifi Al
    </ButtonLink>
  );
}
