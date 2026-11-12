import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";
import type { Database } from "@/shared/supabase/database.types";

export type MediaKind = Database["public"]["Enums"]["media_kind"];
export type MediaItem = Awaited<ReturnType<typeof getPublishedMedia>>[number];

const COLUMNS =
  "id, kind, storage_prefix, file_ext, widths, width, height, alt_text, caption, category";

/** Published images of one kind, in the owner's order. */
export async function getPublishedMedia(kind: MediaKind) {
  "use cache";
  cacheLife("max");
  cacheTag("media");
  const { data, error } = await publicClient()
    .from("media")
    .select(COLUMNS)
    .eq("kind", kind)
    .order("sort_order");
  if (error) throw new Error(`media (${kind}): ${error.message}`);
  return data;
}

/** Published images by id (for other modules, e.g. service images). */
export async function getPublishedMediaByIds(ids: string[]) {
  "use cache";
  cacheLife("max");
  cacheTag("media");
  if (ids.length === 0) return [];
  const { data, error } = await publicClient().from("media").select(COLUMNS).in("id", ids);
  if (error) throw new Error(`media by id: ${error.message}`);
  return data;
}
