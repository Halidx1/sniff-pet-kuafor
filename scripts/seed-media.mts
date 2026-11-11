// Uploads the demo images listed in supabase/seed/media/manifest.json and
// creates their `media` rows, all flagged is_demo (SPEC §6, §15).
//
//   npm run seed:media                      → local Supabase (keys from .env.local)
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… npm run seed:media   → a cloud project
//
// Each image becomes 480/960/1600 px WebP variants (never upscaled) at
// <kind>/<id>/<width>.webp, the same layout admin uploads use (ADR-008).
// Output never contains EXIF/GPS metadata. Safe to re-run: files are
// overwritten, existing rows (which the owner may have edited) are kept.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

type Item = {
  id: string;
  file: string;
  kind: "hero" | "gallery" | "instagram" | "about" | "service";
  alt_text: string;
  category: "cat" | "dog" | null;
  credit: string;
  sort_order: number;
  is_published: boolean;
};

const WIDTHS = [480, 960, 1600];

if (existsSync(".env.local") && !process.env.SUPABASE_SECRET_KEY) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey)
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.example).");

const supabase = createClient(url, secretKey, { auth: { persistSession: false } });
const items: Item[] = JSON.parse(await readFile("supabase/seed/media/manifest.json", "utf8"));

for (const item of items) {
  const source = sharp(await readFile(item.file)).rotate(); // apply EXIF orientation, then drop metadata
  const { width: originalWidth } = await source.metadata();
  const widths = WIDTHS.filter((w) => w <= originalWidth);
  if (widths.length === 0) widths.push(originalWidth);

  const prefix = `${item.kind}/${item.id}`;
  let largest = { width: 0, height: 0 };
  for (const width of widths) {
    const { data, info } = await source
      .clone()
      .resize({ width })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
    const { error } = await supabase.storage.from("media").upload(`${prefix}/${width}.webp`, data, {
      contentType: "image/webp",
      cacheControl: "31536000", // paths never change content (ADR-008)
      upsert: true,
    });
    if (error) throw new Error(`${item.file} @${width}px: ${error.message}`);
    largest = { width: info.width, height: info.height };
  }

  const { error } = await supabase.from("media").upsert(
    {
      id: item.id,
      kind: item.kind,
      storage_prefix: prefix,
      file_ext: "webp",
      widths,
      width: largest.width,
      height: largest.height,
      alt_text: item.alt_text,
      category: item.category,
      credit: item.credit,
      sort_order: item.sort_order,
      is_published: item.is_published,
      is_demo: true,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`${item.file}: ${error.message}`);
  console.log(`✓ ${item.kind.padEnd(9)} ${widths.join("/")} px  ${item.file}`);
}
