import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";
import type { Database } from "@/shared/supabase/database.types";

export type MediaKind = Database["public"]["Enums"]["media_kind"];
export type MediaItem = Awaited<ReturnType<typeof getPublishedMedia>>[number];

const COLUMNS =
  "id, kind, storage_prefix, file_ext, widths, width, height, alt_text, caption, category, group_id, group_role";
// Expand/contract (CLAUDE.md): until the group migration (ADR-031) reaches a
// database, e.g. the cloud dev DB behind a deploy preview, select without the
// group columns and treat every image as ungrouped. Remove once applied everywhere.
const COLUMNS_WITHOUT_GROUPS =
  "id, kind, storage_prefix, file_ext, widths, width, height, alt_text, caption, category";
const UNDEFINED_COLUMN = "42703";
const ungrouped = { group_id: null, group_role: null } as const;

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
  if (error?.code === UNDEFINED_COLUMN) {
    const old = await publicClient()
      .from("media")
      .select(COLUMNS_WITHOUT_GROUPS)
      .eq("kind", kind)
      .order("sort_order");
    if (old.error) throw new Error(`media (${kind}): ${old.error.message}`);
    return old.data.map((row) => ({ ...row, ...ungrouped }));
  }
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
  if (error?.code === UNDEFINED_COLUMN) {
    const old = await publicClient().from("media").select(COLUMNS_WITHOUT_GROUPS).in("id", ids);
    if (old.error) throw new Error(`media by id: ${old.error.message}`);
    return old.data.map((row) => ({ ...row, ...ungrouped }));
  }
  if (error) throw new Error(`media by id: ${error.message}`);
  return data;
}
