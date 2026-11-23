"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  cardCategory,
  cardPhotos,
  type GalleryCard,
  type GroupRole,
} from "../domain/gallery-cards";

export type GalleryPhoto = {
  id: string;
  alt: string;
  caption: string | null;
  category: "cat" | "dog" | null;
  group_id: string | null;
  group_role: GroupRole | null;
  width: number;
  height: number;
  thumb: string;
  srcSet: string;
  large: string;
};

type Card = GalleryCard<GalleryPhoto>;
type Filter = "all" | "cat" | "dog";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "cat", label: "Kedi" },
  { value: "dog", label: "Köpek" },
];

// Each tile is half a card; cards are half the container from `sm` up.
const TILE_SIZES = "(min-width: 1280px) 19rem, (min-width: 640px) 25vw, 50vw";

/**
 * Symmetric grid of post cards (Önce | Sonra pairs and carousels) with an optional
 * Kedi/Köpek filter and a native <dialog> lightbox (Escape closes, arrows browse
 * every photo, including each post's cover collage).
 */
export function GalleryLightbox({
  cards,
  priority = false,
}: {
  cards: Card[];
  priority?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const visibleCards = filter === "all" ? cards : cards.filter((c) => cardCategory(c) === filter);
  const photos = visibleCards.flatMap(cardPhotos);
  const showFilter =
    cards.some((c) => cardCategory(c) === "cat") && cards.some((c) => cardCategory(c) === "dog");
  const current = index === null ? null : photos[index];

  const open = (photo: GalleryPhoto) => {
    setIndex(photos.indexOf(photo));
    dialog.current?.showModal();
  };
  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));

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

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {visibleCards.map((card, cardIndex) => {
          const eager = priority && cardIndex === 0;
          return (
            <li key={card.id} className={card.kind === "single" ? "col-span-1" : "col-span-2"}>
              {card.kind === "pair" && (
                <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl bg-beige">
                  <Tile photo={card.before} label="Önce" onOpen={open} eager={eager} />
                  <Tile photo={card.after} label="Sonra" onOpen={open} eager={eager} />
                </div>
              )}
              {card.kind === "carousel" && (
                <Carousel slides={card.slides} onOpen={open} eager={eager} />
              )}
              {card.kind === "single" && (
                <div className="overflow-hidden rounded-2xl bg-beige">
                  <Tile photo={card.image} onOpen={open} eager={eager} />
                </div>
              )}
            </li>
          );
        })}
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
              {photos.length > 1 && (
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
              {photos.length > 1 && (
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

/** One square photo that opens the lightbox; `label` adds the "Önce"/"Sonra" tag. */
function Tile({
  photo,
  label,
  onOpen,
  eager = false,
}: {
  photo: GalleryPhoto;
  label?: string;
  onOpen: (photo: GalleryPhoto) => void;
  /** Above the fold: load now, with high priority. */
  eager?: boolean;
}) {
  return (
    // The tag sits outside the button: the photo's alt text already says
    // "Bakım öncesi/sonrası", and visible text inside a button must be part of its name.
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpen(photo)}
        aria-label={`Fotoğrafı büyüt: ${photo.alt}`}
        className="group block w-full overflow-hidden bg-beige"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized variants (ADR-008) */}
        <img
          src={photo.thumb}
          srcSet={photo.srcSet}
          sizes={TILE_SIZES}
          width={photo.width}
          height={photo.height}
          alt=""
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>
      {label && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-navy px-3 py-1 font-heading text-sm font-bold text-cream sm:bottom-3 sm:left-3"
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** Two photos visible at a time, scrolled sideways (swipe, or the arrow buttons). */
function Carousel({
  slides,
  onOpen,
  eager = false,
}: {
  slides: GalleryPhoto[];
  onOpen: (photo: GalleryPhoto) => void;
  eager?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    // Wrap around at either end, so the buttons never go dead.
    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (direction === -1 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: (direction * el.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain rounded-2xl bg-beige [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((photo, i) => (
          <div key={photo.id} className="w-[calc(50%-2px)] shrink-0 snap-start">
            <Tile photo={photo} onOpen={onOpen} eager={eager && i < 2} />
          </div>
        ))}
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 rounded-full bg-navy px-3 py-1 font-heading text-sm font-bold text-cream sm:top-3 sm:right-3"
      >
        {slides.length} fotoğraf
      </span>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Önceki fotoğraflar"
        className="lightbox-btn absolute top-1/2 left-2 -translate-y-1/2"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Sonraki fotoğraflar"
        className="lightbox-btn absolute top-1/2 right-2 -translate-y-1/2"
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
