import { ArrowDown, ArrowUp, Eye, EyeOff, Unlink } from "lucide-react";
import { requiredEnv } from "@/shared/lib/env";
import { FormMessage } from "@/shared/ui/form";
import {
  addMedia,
  deleteMedia,
  groupMedia,
  moveMedia,
  requestUpload,
  saveMediaDetails,
  setMediaPublished,
  ungroupMedia,
} from "../actions";
import { listMediaForAdmin, type AdminMediaItem } from "../data/media-admin-repo";
import { cardPhotos, toGalleryCards, type GalleryCard } from "../domain/gallery-cards";
import { variantUrl } from "../domain/image-urls";
import type { ManagedKind } from "../schemas";
import { MediaDetailsForm } from "./media-details-form";
import { MediaUploader } from "./media-uploader";

/** What each list is for, in the owner's words. */
const ABOUT: Record<ManagedKind, string> = {
  gallery:
    "Galeri sayfasında ve anasayfada görünen fotoğraflar. Her kart sitede bu sırayla görünür.",
  hero: "Anasayfanın en üstündeki fotoğraf. Sitede yayındaki ilk fotoğraf görünür.",
  about: "Hakkımızda sayfasındaki fotoğraf. Sitede yayındaki ilk fotoğraf görünür.",
  instagram: "Anasayfadaki Instagram bölümü. Yayındaki ilk 6 fotoğraf görünür.",
};

const GROUP_ERRORS: Record<string, string> = {
  pair: "Önce / Sonra kartı için tam iki tek fotoğraf seçin.",
  carousel: "Karusel için en az iki tek fotoğraf seçin (en fazla 20).",
  grup: "Fotoğraflar birleştirilemedi. Lütfen yeniden seçin.",
};

/** The panel's photo manager for one list (SPEC §14.5). */
export async function MediaManager({ kind, error }: { kind: ManagedKind; error?: string }) {
  const base = requiredEnv("SUPABASE_URL");
  const cards = toGalleryCards(await listMediaForAdmin(kind));
  const isGallery = kind === "gallery";
  const canGroup = isGallery && cards.filter((c) => c.kind === "single").length >= 2;

  return (
    <div className="space-y-8">
      <p className="max-w-2xl leading-relaxed">{ABOUT[kind]}</p>
      <MediaUploader
        kind={kind}
        showCategory={isGallery}
        requestUpload={requestUpload}
        addMedia={addMedia}
      />

      {error && <FormMessage error={GROUP_ERRORS[error] ?? GROUP_ERRORS.grup} />}

      {canGroup && (
        <form id="group-form" action={groupMedia} className="rounded-2xl bg-white p-5">
          <h2 className="text-xl font-extrabold">Fotoğrafları birleştir</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-text">
            Aynı paylaşıma ait fotoğrafları aşağıda “Birleştirmek için seç” ile işaretleyin. Önce /
            Sonra kartında listede üstteki fotoğraf “Önce”, alttaki “Sonra” olur.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <SmallButton name="layout" value="pair">
              Önce / Sonra kartı yap
            </SmallButton>
            <SmallButton name="layout" value="carousel">
              Karusel yap
            </SmallButton>
          </div>
        </form>
      )}

      {cards.length === 0 ? (
        <p className="rounded-2xl bg-white p-5">Henüz fotoğraf yok.</p>
      ) : (
        <ol className="space-y-6" aria-label="Fotoğraflar">
          {cards.map((card, n) => (
            <CardItem
              key={card.id}
              card={card}
              kind={kind}
              position={n + 1}
              count={cards.length}
              base={base}
              selectable={canGroup && card.kind === "single"}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function CardItem({
  card,
  kind,
  position,
  count,
  base,
  selectable,
}: {
  card: GalleryCard<AdminMediaItem>;
  kind: ManagedKind;
  position: number;
  count: number;
  base: string;
  selectable: boolean;
}) {
  const photos = cardPhotos(card);
  const published = photos.filter((p) => p.is_published).length;
  const allPublished = published === photos.length;
  const isDemo = photos.some((p) => p.is_demo);
  const title =
    card.kind === "pair"
      ? "Önce / Sonra kartı"
      : card.kind === "carousel"
        ? `Karusel · ${photos.length} fotoğraf`
        : "Fotoğraf";
  const name = `${position}. kart`;

  return (
    <li className="rounded-2xl bg-white p-5" aria-label={`${name}: ${title}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h3 className="font-heading text-lg font-extrabold">
          {position}. {title}
        </h3>
        <Badge tone={allPublished ? "on" : "off"}>
          {allPublished ? "Yayında" : published > 0 ? "Kısmen yayında" : "Gizli"}
        </Badge>
        {isDemo && <Badge tone="demo">DEMO — İşletme onayı gerekli</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={setMediaPublished}>
          {photos.map((p) => (
            <input key={p.id} type="hidden" name="id" value={p.id} />
          ))}
          <input type="hidden" name="publish" value={String(!allPublished)} />
          <SmallButton aria-label={`${name}: ${allPublished ? "gizle" : "yayınla"}`}>
            {allPublished ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
            {allPublished ? "Gizle" : "Yayınla"}
          </SmallButton>
        </form>
        <MoveButton
          kind={kind}
          card={card.id}
          direction="up"
          disabled={position === 1}
          name={name}
        />
        <MoveButton
          kind={kind}
          card={card.id}
          direction="down"
          disabled={position === count}
          name={name}
        />
        {card.kind !== "single" && (
          <form action={ungroupMedia}>
            <input type="hidden" name="group" value={card.id} />
            <SmallButton aria-label={`${name}: fotoğrafları ayır`}>
              <Unlink className="size-4" aria-hidden="true" />
              Fotoğrafları ayır
            </SmallButton>
          </form>
        )}
      </div>

      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        {photos.map((photo) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            role={card.kind === "pair" ? photo.group_role : null}
            base={base}
            showCategory={kind === "gallery"}
            selectable={selectable}
          />
        ))}
      </ul>
    </li>
  );
}

const ROLE_LABEL: Record<string, string> = { before: "Önce", after: "Sonra", cover: "Kapak" };

function PhotoItem({
  photo,
  role,
  base,
  showCategory,
  selectable,
}: {
  photo: AdminMediaItem;
  role: string | null;
  base: string;
  showCategory: boolean;
  selectable: boolean;
}) {
  return (
    <li className="space-y-3">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- stored variants (ADR-008) */}
        <img
          src={variantUrl(base, photo, photo.widths[0]!)}
          alt=""
          width={photo.width}
          height={photo.height}
          loading="lazy"
          className="aspect-4/3 w-full rounded-xl bg-beige object-cover"
        />
        {role && (
          <span className="absolute top-2 left-2 rounded-full bg-navy px-3 py-1 text-sm font-bold text-cream">
            {ROLE_LABEL[role] ?? role}
          </span>
        )}
      </div>
      <p>
        <span className="text-sm text-muted-text">Açıklama: </span>
        {photo.alt_text}
      </p>
      {!photo.is_published && <p className="text-sm font-semibold">Bu fotoğraf gizli.</p>}
      {selectable && (
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="id"
            value={photo.id}
            form="group-form"
            className="size-5 accent-navy"
          />
          Birleştirmek için seç
          <span className="sr-only">: {photo.alt_text}</span>
        </label>
      )}
      <details className="rounded-xl border-2 border-beige p-3">
        <summary className="min-h-11 cursor-pointer content-center font-heading font-bold">
          Düzenle<span className="sr-only">: {photo.alt_text}</span>
        </summary>
        <div className="mt-3">
          <MediaDetailsForm photo={photo} showCategory={showCategory} action={saveMediaDetails} />
        </div>
      </details>
      <details className="rounded-xl border-2 border-beige p-3">
        <summary className="min-h-11 cursor-pointer content-center font-heading font-bold text-danger">
          Sil<span className="sr-only">: {photo.alt_text}</span>
        </summary>
        <form action={deleteMedia} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={photo.id} />
          <p>Bu fotoğraf siteden ve depodan kalıcı olarak silinir. Geri alınamaz.</p>
          <button
            type="submit"
            className="min-h-11 rounded-full bg-danger px-5 font-heading font-bold text-white"
          >
            Evet, kalıcı olarak sil
          </button>
        </form>
      </details>
    </li>
  );
}

function MoveButton({
  kind,
  card,
  direction,
  disabled,
  name,
}: {
  kind: ManagedKind;
  card: string;
  direction: "up" | "down";
  disabled: boolean;
  name: string;
}) {
  const up = direction === "up";
  return (
    <form action={moveMedia}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="card" value={card} />
      <input type="hidden" name="direction" value={direction} />
      <SmallButton disabled={disabled} aria-label={`${name}: ${up ? "yukarı" : "aşağı"} taşı`}>
        {up ? (
          <ArrowUp className="size-4" aria-hidden="true" />
        ) : (
          <ArrowDown className="size-4" aria-hidden="true" />
        )}
        {up ? "Yukarı" : "Aşağı"}
      </SmallButton>
    </form>
  );
}

function SmallButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-navy px-4 font-heading font-bold hover:bg-navy hover:text-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy"
      {...props}
    />
  );
}

function Badge({ tone, children }: { tone: "on" | "off" | "demo"; children: React.ReactNode }) {
  const tones = {
    on: "bg-navy text-cream",
    off: "border-2 border-navy/40",
    demo: "bg-caramel text-navy",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${tones[tone]}`}>{children}</span>
  );
}
