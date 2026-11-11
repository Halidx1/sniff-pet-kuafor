"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";

export type GalleryPhoto = {
  id: string;
  alt: string;
  caption: string | null;
  category: "cat" | "dog" | null;
  width: number;
  height: number;
  thumb: string;
  srcSet: string;
  large: string;
};

type Filter = "all" | "cat" | "dog";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "cat", label: "Kedi" },
  { value: "dog", label: "Köpek" },
];

/** Grid with an optional Kedi/Köpek filter and a native <dialog> lightbox (Escape closes, arrows browse). */
export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const visible = filter === "all" ? photos : photos.filter((p) => p.category === filter);
  const showFilter =
    photos.some((p) => p.category === "cat") && photos.some((p) => p.category === "dog");
  const current = index === null ? null : visible[index];

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length));

  return (
    <>
      {showFilter && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Fotoğrafları filtrele">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className="min-h-11 rounded-full border-2 border-navy px-5 font-heading font-bold aria-pressed:bg-navy aria-pressed:text-cream"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {visible.map((photo, i) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Fotoğrafı büyüt: ${photo.alt}`}
              className="block w-full overflow-hidden rounded-2xl bg-beige"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized variants (ADR-008) */}
              <img
                src={photo.thumb}
                srcSet={photo.srcSet}
                sizes="(min-width: 1024px) 33vw, 50vw"
                width={photo.width}
                height={photo.height}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Fotoğraf"
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[92dvh] w-[min(92vw,64rem)] overflow-visible bg-transparent backdrop:bg-navy/85"
      >
        {current && (
          <figure className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized variants (ADR-008) */}
            <img
              src={current.large}
              width={current.width}
              height={current.height}
              alt={current.alt}
              className="max-h-[78dvh] w-auto rounded-2xl object-contain"
            />
            {current.caption && (
              <figcaption className="text-center text-cream">{current.caption}</figcaption>
            )}
            <div className="flex gap-3">
              {visible.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="lightbox-btn"
                  aria-label="Önceki fotoğraf"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="lightbox-btn"
                aria-label="Kapat"
                autoFocus
              >
                <X aria-hidden="true" />
              </button>
              {visible.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="lightbox-btn"
                  aria-label="Sonraki fotoğraf"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              )}
            </div>
          </figure>
        )}
      </dialog>
    </>
  );
}
