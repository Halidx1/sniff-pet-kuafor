import { preconnect } from "react-dom";
import { requiredEnv } from "@/shared/lib/env";
import type { MediaItem } from "../data/media-repo";
import { toGalleryCards } from "../domain/gallery-cards";
import { fallbackSrc, srcSet, variantUrl } from "../domain/image-urls";
import { GalleryLightbox, type GalleryPhoto } from "./gallery-lightbox";

type Props = {
  images: MediaItem[];
  /** Show only the first n cards (the homepage preview). */
  limit?: number;
  /** The gallery is the top of the page: load the first card's photos first (LCP). */
  priority?: boolean;
};

/**
 * Server part: groups the rows into cards (one per Instagram post, ADR-031) and
 * turns them into ready URLs, so the browser code needs no configuration.
 */
export function Gallery({ images, limit, priority = false }: Props) {
  const base = requiredEnv("SUPABASE_URL");
  // Photos come from Supabase Storage, another origin: open that connection early.
  preconnect(new URL(base).origin);
  const photos: GalleryPhoto[] = images.map((image) => ({
    id: image.id,
    alt: image.alt_text,
    caption: image.caption,
    category: image.category,
    group_id: image.group_id,
    group_role: image.group_role,
    width: image.width,
    height: image.height,
    thumb: fallbackSrc(base, image, 480),
    srcSet: srcSet(base, image),
    large: variantUrl(base, image, Math.max(...image.widths)),
  }));
  const cards = toGalleryCards(photos);
  return <GalleryLightbox cards={limit ? cards.slice(0, limit) : cards} priority={priority} />;
}
