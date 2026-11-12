import { describe, expect, it } from "vitest";
import { fallbackSrc, srcSet, variantUrl } from "./image-urls";

const base = "https://x.supabase.co";
const image = { storage_prefix: "hero/abc", file_ext: "webp", widths: [1600, 480, 960] };

describe("image URLs", () => {
  it("points at the public object path", () => {
    expect(variantUrl(base, image, 480)).toBe(
      "https://x.supabase.co/storage/v1/object/public/media/hero/abc/480.webp",
    );
  });

  it("lists variants smallest first with their widths", () => {
    expect(srcSet(base, image)).toBe(
      `${variantUrl(base, image, 480)} 480w, ${variantUrl(base, image, 960)} 960w, ${variantUrl(base, image, 1600)} 1600w`,
    );
  });

  it("falls back to the variant closest above the target, else the largest", () => {
    expect(fallbackSrc(base, image)).toBe(variantUrl(base, image, 960));
    expect(fallbackSrc(base, { ...image, widths: [480] })).toBe(variantUrl(base, image, 480));
  });
});
