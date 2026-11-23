// Rules for an admin upload (ADR-008): which sizes to make and how hard to compress.
// Pure: shared by the browser (resizing) and the server (checking what arrived).

/** The stored widths; a photo is never enlarged, so small photos get fewer. */
export const UPLOAD_WIDTHS = [480, 960, 1600] as const;

/** Aim for files under this size; quality steps down until they fit (or bottom out). */
export const TARGET_BYTES = 300_000;
export const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52] as const;

/** Photos smaller than this on the long edge look blurry on the site. */
export const MIN_SOURCE_WIDTH = 320;

/** The widths to store for a photo `originalWidth` pixels wide. */
export function planWidths(originalWidth: number): number[] {
  const widths: number[] = UPLOAD_WIDTHS.filter((w) => w <= originalWidth);
  return widths.length > 0 ? widths : [Math.round(originalWidth)];
}

/** Height at `width`, keeping the photo's proportions. */
export function scaledHeight(original: { width: number; height: number }, width: number): number {
  return Math.max(1, Math.round((original.height * width) / original.width));
}

/** Server check: widths look like planWidths() made them (sorted, no duplicates, no surprises). */
export function isValidWidths(widths: number[]): boolean {
  if (widths.length === 0 || widths.length > UPLOAD_WIDTHS.length) return false;
  const largest = widths.at(-1)!;
  if (largest < UPLOAD_WIDTHS[0]) {
    return widths.length === 1 && Number.isInteger(largest) && largest >= MIN_SOURCE_WIDTH;
  }
  return JSON.stringify(widths) === JSON.stringify(planWidths(largest));
}

/** The file names a stored photo consists of, e.g. ["480.webp", "960.webp"]. */
export function variantNames(widths: number[], ext: string): string[] {
  return widths.map((w) => `${w}.${ext}`);
}
