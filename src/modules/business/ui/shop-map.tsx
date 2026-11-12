"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  latitude: number;
  longitude: number;
  /** Google Maps link for the fallback when the map can't load. */
  mapsUrl: string | null;
  className?: string;
};

/**
 * The shop's position on a clean map (ADR-020): streets only, one brand pin, no other
 * businesses. The map engine is downloaded only when this box scrolls near the viewport;
 * until then (and if loading fails) a same-sized placeholder holds the space.
 */
export function ShopMap({ latitude, longitude, mapsUrl, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"waiting" | "ready" | "failed">("waiting");

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
          .then(({ mountShopMap }) => mountShopMap(container, { latitude, longitude }))
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
      <div ref={containerRef} className="absolute inset-0" />
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
