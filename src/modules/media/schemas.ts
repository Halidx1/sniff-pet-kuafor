import { z } from "zod";
import { isValidWidths } from "./domain/upload-plan";

// Media manager inputs (SPEC §14.5), checked again by the database constraints.

/** The lists the panel manages. Service images come with the services editor. */
export const MANAGED_KINDS = ["gallery", "hero", "about", "instagram"] as const;
export const managedKind = z.enum(MANAGED_KINDS);
export type ManagedKind = z.infer<typeof managedKind>;

const ext = z.enum(["webp", "jpg"]);
const widths = z
  .array(z.number().int().positive())
  .refine(isValidWidths, "Fotoğraf boyutları beklenmedik.");
const id = z.uuid();

const altText = z
  .string()
  .trim()
  .min(1, "Fotoğrafta ne olduğunu kısaca yazın (görme engelli ziyaretçiler için).")
  .max(200, "Açıklama en fazla 200 karakter olabilir.");
const caption = z
  .string()
  .trim()
  .max(300, "Alt yazı en fazla 300 karakter olabilir.")
  .transform((value) => value || null);
const category = z.enum(["", "cat", "dog"]).transform((value) => (value === "" ? null : value));

/** Step 1: ask for upload addresses. */
export const uploadRequestSchema = z.object({ kind: managedKind, ext, widths });

/** Step 2: the files are up; record the photo (unpublished). */
export const newMediaSchema = z.object({
  kind: managedKind,
  storage_prefix: z.string(),
  ext,
  widths,
  width: z.number().int().positive().max(1600),
  height: z.number().int().positive().max(10_000),
  alt_text: altText,
  caption: caption.default(null),
  category: category.default(null),
});
export type NewMediaInput = z.infer<typeof newMediaSchema>;

/** The per-photo edit form. */
export const mediaDetailsSchema = z.object({
  id,
  alt_text: altText,
  caption,
  category,
});
export type MediaDetailsInput = z.infer<typeof mediaDetailsSchema>;

export const publishSchema = z.object({
  ids: z.array(id).min(1).max(20),
  publish: z.enum(["true", "false"]).transform((v) => v === "true"),
});
export const moveSchema = z.object({
  kind: managedKind,
  card: id,
  direction: z.enum(["up", "down"]),
});
export const groupSchema = z.object({
  ids: z.array(id).min(2).max(20),
  layout: z.enum(["pair", "carousel"]),
});
export const ungroupSchema = z.object({ group: id });
export const deleteSchema = z.object({ id });
