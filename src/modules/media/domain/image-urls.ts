// Builds the public URLs of the stored size variants (ADR-008). No I/O.

type Stored = { storage_prefix: string; file_ext: string; widths: number[] };

export function variantUrl(baseUrl: string, image: Stored, width: number): string {
  return `${baseUrl}/storage/v1/object/public/media/${image.storage_prefix}/${width}.${image.file_ext}`;
}

/** "…/480.webp 480w, …/960.webp 960w" for the browser to pick from. */
export function srcSet(baseUrl: string, image: Stored): string {
  return [...image.widths]
    .sort((a, b) => a - b)
    .map((w) => `${variantUrl(baseUrl, image, w)} ${w}w`)
    .join(", ");
}

/** Fallback src: the smallest variant that is at least `target` wide, else the largest. */
export function fallbackSrc(baseUrl: string, image: Stored, target = 960): string {
  const sorted = [...image.widths].sort((a, b) => a - b);
  return variantUrl(baseUrl, image, sorted.find((w) => w >= target) ?? sorted.at(-1)!);
}
