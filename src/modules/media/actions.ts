"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/modules/identity";
import { formValues, toFieldErrors, type FormState } from "@/shared/lib/form-state";
import {
  createUploadTargets,
  deleteMediaRow,
  groupMediaRows,
  insertMedia,
  listFiles,
  listMediaForAdmin,
  removeFiles,
  reorderMedia,
  setPublished,
  ungroupIfAlone,
  ungroupMediaRows,
  updateMediaDetails,
} from "./data/media-admin-repo";
import { moveCard, photoOrder } from "./domain/card-order";
import { toGalleryCards } from "./domain/gallery-cards";
import { variantNames } from "./domain/upload-plan";
import {
  deleteSchema,
  groupSchema,
  mediaDetailsSchema,
  moveSchema,
  newMediaSchema,
  publishSchema,
  ungroupSchema,
  uploadRequestSchema,
  type ManagedKind,
} from "./schemas";

// Media manager use cases (SPEC §14.5, ADR-008): requireAdmin → Zod → repository →
// refresh the public pages. Uploading is two calls around the browser's own PUTs:
// requestUpload() hands out one-time addresses, addMedia() records what arrived.

/** <kind>/<uuid>, as requestUpload() makes them. */
const FOLDER = /^(gallery|hero|about|instagram)\/[0-9a-f-]{36}$/;

export type UploadTargets =
  { prefix: string; targets: { width: number; url: string }[] } | { error: string };

export async function requestUpload(input: unknown): Promise<UploadTargets> {
  await requireAdmin();
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return { error: "Fotoğraf hazırlanamadı. Başka bir fotoğraf deneyin." };
  const { kind, ext, widths } = parsed.data;
  // A fresh random folder per photo: unguessable, never reused (ADR-009).
  const prefix = `${kind}/${randomUUID()}`;
  const urls = await createUploadTargets(
    variantNames(widths, ext).map((name) => `${prefix}/${name}`),
  );
  return { prefix, targets: widths.map((width, i) => ({ width, url: urls[i]! })) };
}

export async function addMedia(input: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = newMediaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: Object.values(toFieldErrors(parsed.error.issues))[0] };
  }
  const { kind, storage_prefix, ext, widths, ...details } = parsed.data;
  // Only a folder this kind of upload gets (requestUpload), holding exactly its files.
  if (!FOLDER.test(storage_prefix) || !storage_prefix.startsWith(`${kind}/`)) {
    return { error: "Yükleme bulunamadı. Lütfen tekrar deneyin." };
  }
  const expected = variantNames(widths, ext).sort();
  const stored = (await listFiles(storage_prefix)).sort();
  if (JSON.stringify(stored) !== JSON.stringify(expected)) {
    return { error: "Fotoğraf tam yüklenemedi. Lütfen tekrar deneyin." };
  }
  await insertMedia({ kind, storage_prefix, file_ext: ext, widths, ...details });
  // Unpublished, so the public site doesn't change yet.
  return {};
}

export async function saveMediaDetails(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  const parsed = mediaDetailsSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: toFieldErrors(parsed.error.issues) };
  await updateMediaDetails(parsed.data);
  updateTag("media");
  return { message: "Kaydedildi." };
}

export async function setMediaPublished(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = publishSchema.safeParse({
    ids: formData.getAll("id"),
    publish: formData.get("publish"),
  });
  if (!parsed.success) return;
  await setPublished(parsed.data.ids, parsed.data.publish);
  updateTag("media");
}

export async function moveMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = moveSchema.safeParse(formValues(formData));
  if (!parsed.success) return;
  const { kind, card, direction } = parsed.data;
  const moved = moveCard(toGalleryCards(await listMediaForAdmin(kind)), card, direction);
  if (!moved) return;
  await reorderMedia(photoOrder(moved));
  updateTag("media");
}

export async function groupMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = groupSchema.safeParse({
    ids: formData.getAll("id"),
    layout: formData.get("layout"),
  });
  if (!parsed.success || !(await groupMediaRows(parsed.data.ids, parsed.data.layout))) {
    redirect(`/admin/fotograflar?hata=${parsed.data?.layout ?? "grup"}`);
  }
  await keepCardsTogether("gallery");
  updateTag("media");
}

export async function ungroupMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = ungroupSchema.safeParse(formValues(formData));
  if (!parsed.success) return;
  await ungroupMediaRows(parsed.data.group);
  updateTag("media");
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = deleteSchema.safeParse(formValues(formData));
  if (!parsed.success) return;
  // Row first, so the site stops showing it even if removing the files fails.
  const deleted = await deleteMediaRow(parsed.data.id);
  if (!deleted) return;
  updateTag("media");
  if (deleted.group_id) await ungroupIfAlone(deleted.group_id);
  await removeFiles(deleted.storage_prefix, await listFiles(deleted.storage_prefix));
}

/** Rewrites the order so every card's photos sit together (after grouping). */
async function keepCardsTogether(kind: ManagedKind) {
  const cards = toGalleryCards(await listMediaForAdmin(kind));
  await reorderMedia(photoOrder(cards));
}
