"use client";

import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Field, FormMessage, Select } from "@/shared/ui/form";
import type { UploadTargets } from "../actions";
import { prepareImage, PrepareError } from "./prepare-image";

type Kind = "gallery" | "hero" | "about" | "instagram";
type Status = "ready" | "working" | "done" | "error";
type Item = {
  key: string;
  file: File;
  preview: string;
  alt: string;
  caption: string;
  category: string;
  status: Status;
  error?: string;
};

export const CATEGORY_OPTIONS = [
  { value: "", label: "Belirtilmedi" },
  { value: "dog", label: "Köpek" },
  { value: "cat", label: "Kedi" },
];

/**
 * Picks photos, asks for a description of each, then resizes them in the browser and
 * uploads them straight to storage (ADR-008). New photos start hidden.
 */
export function MediaUploader({
  kind,
  showCategory,
  requestUpload,
  addMedia,
}: {
  kind: Kind;
  showCategory: boolean;
  requestUpload: (input: unknown) => Promise<UploadTargets>;
  addMedia: (input: unknown) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  // Free the preview images when they leave the list.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const live = new Set(items.map((i) => i.preview));
    for (const url of previews.current) if (!live.has(url)) URL.revokeObjectURL(url);
    previews.current = live;
  }, [items]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const update = (key: string, change: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...change } : i)));

  function choose(files: FileList | null) {
    setMessage(undefined);
    const chosen = [...(files ?? [])].map((file) => ({
      key: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      alt: "",
      caption: "",
      category: "",
      status: "ready" as const,
    }));
    setItems((list) => [...list, ...chosen]);
    if (input.current) input.current.value = "";
  }

  async function uploadOne(item: Item): Promise<string | undefined> {
    const image = await prepareImage(item.file);
    const widths = image.variants.map((v) => v.width);
    const target = await requestUpload({ kind, ext: image.ext, widths });
    if ("error" in target) return target.error;
    for (const [i, variant] of image.variants.entries()) {
      const response = await fetch(target.targets[i]!.url, {
        method: "PUT",
        headers: { "content-type": variant.blob.type, "cache-control": "max-age=31536000" },
        body: variant.blob,
      });
      if (!response.ok)
        return "Fotoğraf yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.";
    }
    const largest = image.variants.at(-1)!;
    const result = await addMedia({
      kind,
      storage_prefix: target.prefix,
      ext: image.ext,
      widths,
      width: largest.width,
      height: largest.height,
      alt_text: item.alt,
      caption: item.caption,
      category: item.category,
    });
    return result.error;
  }

  async function uploadAll() {
    const pending = items.filter((i) => i.status !== "done");
    const missing = pending.filter((i) => !i.alt.trim());
    for (const item of missing) {
      update(item.key, { status: "error", error: "Fotoğrafta ne olduğunu kısaca yazın." });
    }
    if (missing.length > 0) return;
    setBusy(true);
    setMessage(undefined);
    let uploaded = 0;
    for (const item of pending) {
      update(item.key, { status: "working", error: undefined });
      try {
        const error = await uploadOne(item);
        update(item.key, error ? { status: "error", error } : { status: "done" });
        if (!error) uploaded++;
      } catch (e) {
        const error =
          e instanceof PrepareError ? e.message : "Bir sorun oluştu. Lütfen tekrar deneyin.";
        update(item.key, { status: "error", error });
      }
    }
    setBusy(false);
    setItems((list) => list.filter((i) => i.status !== "done"));
    if (uploaded > 0) {
      setMessage(
        `${uploaded} fotoğraf yüklendi. Aşağıda gizli olarak duruyor; hazır olduğunda "Yayınla"ya basın.`,
      );
      router.refresh();
    }
  }

  return (
    <section aria-labelledby={`${inputId}-heading`} className="rounded-2xl bg-white p-5">
      <h2 id={`${inputId}-heading`} className="text-xl font-extrabold">
        Fotoğraf yükle
      </h2>
      <p className="mt-2 text-sm text-muted-text">
        Telefonunuzdaki fotoğrafları seçebilirsiniz. Fotoğraflar yüklenmeden önce küçültülür ve
        konum bilgisi silinir.
      </p>
      <label
        htmlFor={inputId}
        className="mt-4 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-navy px-6 font-heading font-bold focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-navy hover:bg-navy hover:text-cream"
      >
        <ImagePlus className="size-5" aria-hidden="true" />
        Fotoğraf seçin
        <input
          ref={input}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(e) => choose(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <ul className="mt-6 space-y-6">
          {items.map((item, n) => (
            <li
              key={item.key}
              className="grid gap-4 border-t-2 border-beige pt-6 sm:grid-cols-[10rem_1fr]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a local preview (blob: URL) */}
              <img
                src={item.preview}
                alt=""
                className="aspect-square w-40 rounded-xl bg-beige object-cover"
              />
              <div className="space-y-4">
                <Field
                  id={`${item.key}-alt`}
                  label={`Fotoğraf ${n + 1}: ne görünüyor?`}
                  name="alt_text"
                  hint="Ör. “Tıraştan sonra beyaz bir Maltese”. Görme engelli ziyaretçiler için okunur."
                  required
                  maxLength={200}
                  value={item.alt}
                  disabled={item.status === "working"}
                  error={item.status === "error" && !item.alt.trim() ? item.error : undefined}
                  onChange={(e) => update(item.key, { alt: e.target.value })}
                />
                <Field
                  id={`${item.key}-caption`}
                  label="Alt yazı (isteğe bağlı)"
                  name="caption"
                  maxLength={300}
                  value={item.caption}
                  disabled={item.status === "working"}
                  onChange={(e) => update(item.key, { caption: e.target.value })}
                />
                {showCategory && (
                  <Select
                    id={`${item.key}-category`}
                    label="Kedi mi, köpek mi?"
                    name="category"
                    options={CATEGORY_OPTIONS}
                    value={item.category}
                    disabled={item.status === "working"}
                    onChange={(e) => update(item.key, { category: e.target.value })}
                  />
                )}
                {item.status === "working" && (
                  <p role="status" className="font-semibold">
                    Yükleniyor…
                  </p>
                )}
                {item.status === "error" && item.alt.trim() && <FormMessage error={item.error} />}
                <button
                  type="button"
                  disabled={busy}
                  className="min-h-11 font-semibold underline underline-offset-4 disabled:opacity-60"
                  onClick={() => setItems((list) => list.filter((i) => i.key !== item.key))}
                >
                  Listeden çıkar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <Button className="mt-6" disabled={busy} onClick={uploadAll}>
          {busy
            ? "Yükleniyor…"
            : items.length === 1
              ? "Fotoğrafı yükle"
              : `${items.length} fotoğrafı yükle`}
        </Button>
      )}
      <div className="mt-4" aria-live="polite">
        <FormMessage message={message} />
      </div>
    </section>
  );
}
