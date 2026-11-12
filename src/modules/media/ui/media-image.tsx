import { requiredEnv } from "@/shared/lib/env";
import type { MediaItem } from "../data/media-repo";
import { fallbackSrc, srcSet } from "../domain/image-urls";

type Props = {
  image: MediaItem;
  /** How wide the image is on screen, so the browser picks the right variant. */
  sizes: string;
  /** Above the fold (the hero): load immediately and early. */
  priority?: boolean;
  className?: string;
};

export function MediaImage({ image, sizes, priority = false, className = "" }: Props) {
  const base = requiredEnv("SUPABASE_URL");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variants are already sized at upload (ADR-008); next/image would add an optimisation service
    <img
      src={fallbackSrc(base, image)}
      srcSet={srcSet(base, image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt_text}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
