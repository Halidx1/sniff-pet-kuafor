import { requiredEnv } from "@/shared/lib/env";
import type { MediaItem } from "../data/media-repo";
import { fallbackSrc, srcSet, variantUrl } from "../domain/image-urls";
import { GalleryLightbox, type GalleryPhoto } from "./gallery-lightbox";

/** Server part: turns media rows into ready URLs, so the browser code needs no configuration. */
export function Gallery({ images }: { images: MediaItem[] }) {
  const base = requiredEnv("SUPABASE_URL");
  const photos: GalleryPhoto[] = images.map((image) => ({
    id: image.id,
    alt: image.alt_text,
    caption: image.caption,
    category: image.category,
    width: image.width,
    height: image.height,
    thumb: fallbackSrc(base, image, 480),
    srcSet: srcSet(base, image),
    large: variantUrl(base, image, Math.max(...image.widths)),
  }));
  return <GalleryLightbox photos={photos} />;
}
