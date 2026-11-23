// Browser only: turns a chosen photo into the stored sizes (ADR-008). Decoding and
// re-encoding through a canvas also drops all metadata, including GPS location.
import {
  MIN_SOURCE_WIDTH,
  planWidths,
  QUALITY_STEPS,
  scaledHeight,
  TARGET_BYTES,
} from "../domain/upload-plan";

export type Variant = { width: number; height: number; blob: Blob };
export type PreparedImage = { ext: "webp" | "jpg"; variants: Variant[] };

/** Thrown with a Turkish message the uploader shows as is. */
export class PrepareError extends Error {}

export async function prepareImage(file: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    // Turns phone photos the right way up (EXIF orientation) before resizing.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PrepareError("Bu fotoğraf açılamadı. JPEG veya PNG biçiminde bir fotoğraf deneyin.");
  }
  try {
    const original = { width: bitmap.width, height: bitmap.height };
    if (original.width < MIN_SOURCE_WIDTH) {
      throw new PrepareError("Bu fotoğraf çok küçük. Daha büyük bir fotoğraf seçin.");
    }
    // Older Safari versions can't write WebP: fall back to JPEG.
    const type = supportsWebp() ? "image/webp" : "image/jpeg";
    const variants: Variant[] = [];
    for (const width of planWidths(original.width)) {
      const height = scaledHeight(original, width);
      variants.push({ width, height, blob: await encode(scale(bitmap, width, height), type) });
    }
    return { ext: type === "image/webp" ? "webp" : "jpg", variants };
  } finally {
    bitmap.close();
  }
}

function supportsWebp(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new PrepareError("Tarayıcınız fotoğrafı işleyemedi.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}

/** Halves the size step by step, then draws the exact size: sharper than one big jump. */
function scale(source: ImageBitmap, width: number, height: number): HTMLCanvasElement {
  let current: CanvasImageSource = source;
  let w = source.width;
  let h = source.height;
  while (w / 2 >= width) {
    w = Math.round(w / 2);
    h = Math.round(h / 2);
    const step = canvasOf(w, h);
    step.context.drawImage(current, 0, 0, w, h);
    current = step.canvas;
  }
  const out = canvasOf(width, height);
  out.context.drawImage(current, 0, 0, width, height);
  return out.canvas;
}

/** Encodes at falling quality until the file is small enough (or the last step). */
async function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  let blob: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob) throw new PrepareError("Tarayıcınız fotoğrafı işleyemedi.");
    if (blob.size <= TARGET_BYTES) break;
  }
  return blob!;
}
