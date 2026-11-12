"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDirections } from "./use-directions";

type Props = {
  /** Shown to the maps app as the destination's name. */
  name: string;
  latitude: number;
  longitude: number;
  /** The owner's Google Maps link: desktop directions and the fallback if the map fails. */
  mapsUrl: string | null;
  className?: string;
};

/**
 * The shop's position on a clean map (ADR-020): streets only, one brand pin, no other
 * businesses. The map engine is downloaded only when this box scrolls near the viewport;
 * until then (and if loading fails) a same-sized placeholder holds the space.
 * Tapping the map or the pin opens directions in the device's maps app.
 */
export function ShopMap({ name, latitude, longitude, mapsUrl, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"waiting" | "ready" | "failed">("waiting");
  // The map reads the latest link at click time (it changes once the device is known).
  const directions = useDirections({ name, latitude, longitude, mapsUrl });
  const directionsRef = useRef(directions);
  useEffect(() => {
    directionsRef.current = directions;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        import("./shop-map-engine")
          .then(({ mountShopMap }) =>
            mountShopMap(container, { latitude, longitude }, () => directionsRef.current),
          )
          .then((remove) => {
            if (cancelled) return remove();
            cleanup = remove;
            setStatus("ready");
          })
          .catch(() => {
            if (!cancelled) setStatus("failed");
          });
      },
      { rootMargin: "300px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [latitude, longitude]);

  return (
    <div
      className={`relative isolate aspect-[4/3] w-full overflow-hidden rounded-3xl bg-beige ${className}`}
      data-map-status={status}
    >
      {/* MapLibre's CSS sets position: relative on the element it mounts in, which would
          override absolute positioning; so it mounts in a full-size child of the absolute box. */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="size-full" />
      </div>
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <MapPin className="size-10" aria-hidden="true" />
          {status === "failed" ? (
            <p className="max-w-xs">
              Harita şu anda yüklenemedi.{" "}
              {mapsUrl && (
                <a href={mapsUrl} rel="noopener noreferrer" className="font-bold underline">
                  Google Haritalar&apos;da açın
                </a>
              )}
            </p>
          ) : (
            <p className="sr-only">Harita yükleniyor</p>
          )}
        </div>
      )}
    </div>
  );
}
