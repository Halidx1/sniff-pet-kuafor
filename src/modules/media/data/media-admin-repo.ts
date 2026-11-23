import "server-only";
import { adminClient } from "@/shared/supabase/admin-client";
import type { ManagedKind, MediaDetailsInput } from "../schemas";

// Admin reads and writes (never cached): RLS lets only a 2FA admin through, for the
// rows and for the files (storage.objects policies, ADR-009).

const BUCKET = "media";
const ADMIN_COLUMNS =
  "id, kind, storage_prefix, file_ext, widths, width, height, alt_text, caption, category, group_id, group_role, sort_order, is_published, is_demo";

/** Every photo of one list, published or not, in the owner's order. */
export async function listMediaForAdmin(kind: ManagedKind) {
  const { data, error } = await (
    await adminClient()
  )
    .from("media")
    .select(ADMIN_COLUMNS)
    .eq("kind", kind)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(`media (admin ${kind}): ${error.message}`);
  return data;
}
export type AdminMediaItem = Awaited<ReturnType<typeof listMediaForAdmin>>[number];

/** One-time upload addresses, one per file (valid for 2 hours, no overwriting). */
export async function createUploadTargets(paths: string[]) {
  const storage = (await adminClient()).storage.from(BUCKET);
  return Promise.all(
    paths.map(async (path) => {
      const { data, error } = await storage.createSignedUploadUrl(path);
      if (error) throw new Error(`signed upload ${path}: ${error.message}`);
      return data.signedUrl;
    }),
  );
}

/** The file names stored under `prefix`. */
export async function listFiles(prefix: string): Promise<string[]> {
  const { data, error } = await (await adminClient()).storage.from(BUCKET).list(prefix);
  if (error) throw new Error(`list ${prefix}: ${error.message}`);
  return data.map((file) => file.name);
}

export async function removeFiles(prefix: string, names: string[]) {
  if (names.length === 0) return;
  const { error } = await (
    await adminClient()
  ).storage
    .from(BUCKET)
    .remove(names.map((name) => `${prefix}/${name}`));
  if (error) throw new Error(`remove ${prefix}: ${error.message}`);
}

type NewRow = {
  kind: ManagedKind;
  storage_prefix: string;
  file_ext: "webp" | "jpg";
  widths: number[];
  width: number;
  height: number;
  alt_text: string;
  caption: string | null;
  category: "cat" | "dog" | null;
};

/** Adds a photo, unpublished, at the top of its list. */
export async function insertMedia(row: NewRow) {
  const supabase = await adminClient();
  const { data: first, error: readError } = await supabase
    .from("media")
    .select("sort_order")
    .eq("kind", row.kind)
    .order("sort_order")
    .limit(1);
  if (readError) throw new Error(`media insert: ${readError.message}`);
  const { error } = await supabase.from("media").insert({
    ...row,
    sort_order: (first[0]?.sort_order ?? 1) - 1,
    is_published: false,
    is_demo: false,
  });
  if (error) throw new Error(`media insert: ${error.message}`);
}

/** Saves the texts; the owner has now checked this photo, so it's no longer a demo. */
export async function updateMediaDetails({ id, ...values }: MediaDetailsInput) {
  const { error } = await (
    await adminClient()
  )
    .from("media")
    .update({ ...values, is_demo: false })
    .eq("id", id);
  if (error) throw new Error(`media update: ${error.message}`);
}

export async function setPublished(ids: string[], isPublished: boolean) {
  const { error } = await (
    await adminClient()
  )
    .from("media")
    .update({ is_published: isPublished })
    .in("id", ids);
  if (error) throw new Error(`media publish: ${error.message}`);
}

/** Deletes the row and returns where its files were and its group, or null if no such row. */
export async function deleteMediaRow(id: string) {
  const { data, error } = await (
    await adminClient()
  )
    .from("media")
    .delete()
    .eq("id", id)
    .select("storage_prefix, group_id");
  if (error) throw new Error(`media delete: ${error.message}`);
  return data[0] ?? null;
}

/** A group left with one photo is no group: free that photo so it can be grouped again. */
export async function ungroupIfAlone(groupId: string) {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("media").select("id").eq("group_id", groupId);
  if (error) throw new Error(`media group check: ${error.message}`);
  if (data.length === 1) await ungroupMediaRows(groupId);
}

export async function reorderMedia(ids: string[]) {
  const { error } = await (await adminClient()).rpc("media_reorder", { p_ids: ids });
  if (error) throw new Error(`media reorder: ${error.message}`);
}

/** Groups photos into one card; false when the database refuses (see media_group()). */
export async function groupMediaRows(ids: string[], layout: "pair" | "carousel") {
  const { error } = await (
    await adminClient()
  ).rpc("media_group", {
    p_ids: ids,
    p_layout: layout,
  });
  if (error?.code === "22023") return false;
  if (error) throw new Error(`media group: ${error.message}`);
  return true;
}

export async function ungroupMediaRows(groupId: string) {
  const { error } = await (
    await adminClient()
  )
    .from("media")
    .update({ group_id: null, group_role: null })
    .eq("group_id", groupId);
  if (error) throw new Error(`media ungroup: ${error.message}`);
}
