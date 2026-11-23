import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";
import type { Database } from "@/shared/supabase/database.types";

export type MediaKind = Database["public"]["Enums"]["media_kind"];
// One list for the query and the type, so they can't drift apart.
const MEDIA_COLUMNS = [
  "id",
  "kind",
  "storage_prefix",
  "file_ext",
  "widths",
  "width",
  "height",
  "alt_text",
  "caption",
  "category",
  "group_id",
  "group_role",
] as const;
const GROUP_COLUMNS = ["group_id", "group_role"];
export type MediaItem = Pick<
  Database["public"]["Tables"]["media"]["Row"],
  (typeof MEDIA_COLUMNS)[number]
>;
type MediaRow = MediaItem;

const COLUMNS = MEDIA_COLUMNS.join(", ");
// Expand/contract (CLAUDE.md): until the group migration (ADR-031) reaches a
// database, e.g. the cloud dev DB behind a deploy preview, select without the
// group columns and treat every image as ungrouped. Remove once applied everywhere.
const COLUMNS_WITHOUT_GROUPS = MEDIA_COLUMNS.filter((c) => !GROUP_COLUMNS.includes(c)).join(", ");
const UNDEFINED_COLUMN = "42703";
const ungrouped = { group_id: null, group_role: null } as const;

type MediaQuery = (columns: string) => PromiseLike<{
  data: unknown;
  error: { code?: string; message: string } | null;
}>;

/** Runs `query` with the group columns, or without them (as ungrouped) on an older DB. */
async function selectMedia(query: MediaQuery, label: string): Promise<MediaRow[]> {
  const first = await query(COLUMNS);
  if (first.error?.code !== UNDEFINED_COLUMN) {
    if (first.error) throw new Error(`${label}: ${first.error.message}`);
    return (first.data ?? []) as MediaRow[];
  }
  const old = await query(COLUMNS_WITHOUT_GROUPS);
  if (old.error) throw new Error(`${label}: ${old.error.message}`);
  return ((old.data ?? []) as Omit<MediaRow, "group_id" | "group_role">[]).map((row) => ({
    ...row,
    ...ungrouped,
  }));
}

/** Published images of one kind, in the owner's order. */
export async function getPublishedMedia(kind: MediaKind) {
  "use cache";
  cacheLife("max");
  cacheTag("media");
  return selectMedia(
    (columns) => publicClient().from("media").select(columns).eq("kind", kind).order("sort_order"),
    `media (${kind})`,
  );
}

/** Published images by id (for other modules, e.g. service images). */
export async function getPublishedMediaByIds(ids: string[]) {
  "use cache";
  cacheLife("max");
  cacheTag("media");
  if (ids.length === 0) return [];
  return selectMedia(
    (columns) => publicClient().from("media").select(columns).in("id", ids),
    "media by id",
  );
}
