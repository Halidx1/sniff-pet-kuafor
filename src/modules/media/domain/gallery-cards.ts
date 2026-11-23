// Turns gallery images into cards (ADR-031): one card per Instagram post.
// Pure: no I/O, so the rules are unit-tested and shared by server and browser code.

export type GroupRole = "cover" | "before" | "after" | "slide";

export type Groupable = {
  id: string;
  group_id: string | null;
  group_role: GroupRole | null;
  category: "cat" | "dog" | null;
};

export type GalleryCard<T> =
  /** Before | After side by side; the cover collage only shows in the lightbox. */
  | { kind: "pair"; id: string; before: T; after: T; cover: T | null }
  /** Several photos of one post, browsed sideways. */
  | { kind: "carousel"; id: string; slides: T[] }
  | { kind: "single"; id: string; image: T };

const ROLE_ORDER: Record<GroupRole, number> = { cover: 0, before: 1, after: 2, slide: 3 };

/**
 * Groups images (already in the owner's order) into cards, in order of each
 * card's first image. A group with a before and an after photo and nothing else
 * but a cover becomes a pair; any other group becomes a carousel of all its
 * photos (cover, before, after, then slides), or a single if it has one photo.
 */
export function toGalleryCards<T extends Groupable>(images: T[]): GalleryCard<T>[] {
  const groups = new Map<string, T[]>();
  const order: (string | T)[] = [];
  for (const image of images) {
    if (!image.group_id) {
      order.push(image);
      continue;
    }
    const members = groups.get(image.group_id);
    if (members) members.push(image);
    else {
      groups.set(image.group_id, [image]);
      order.push(image.group_id);
    }
  }

  return order.map((entry): GalleryCard<T> => {
    if (typeof entry !== "string") return { kind: "single", id: entry.id, image: entry };
    const members = groups.get(entry)!;
    const byRole = (role: GroupRole) => members.find((m) => m.group_role === role);
    const before = byRole("before");
    const after = byRole("after");
    const onlyPairRoles = members.every((m) => m.group_role !== "slide");
    if (before && after && onlyPairRoles) {
      return { kind: "pair", id: entry, before, after, cover: byRole("cover") ?? null };
    }
    if (members.length === 1) return { kind: "single", id: entry, image: members[0]! };
    const slides = [...members].sort(
      (a, b) => ROLE_ORDER[a.group_role ?? "slide"] - ROLE_ORDER[b.group_role ?? "slide"],
    );
    return { kind: "carousel", id: entry, slides };
  });
}

/** Every photo of a card in viewing order, for the lightbox (the cover comes first). */
export function cardPhotos<T>(card: GalleryCard<T>): T[] {
  if (card.kind === "pair")
    return card.cover ? [card.cover, card.before, card.after] : [card.before, card.after];
  if (card.kind === "carousel") return card.slides;
  return [card.image];
}

/** A card's pet category: the first photo's, used by the Kedi/Köpek filter. */
export function cardCategory<T extends Groupable>(card: GalleryCard<T>) {
  return cardPhotos(card)[0]?.category ?? null;
}
