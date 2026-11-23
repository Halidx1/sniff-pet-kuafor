// Moving a gallery card up or down (issue #32). Pure.
// The order is stored per photo (sort_order); a card's place is its first photo's,
// so moving a card means rewriting the whole list with each card's photos together.
import { cardPhotos, type GalleryCard } from "./gallery-cards";

export type Direction = "up" | "down";

/** The cards with `cardId` swapped with its neighbour, or null if it can't move that way. */
export function moveCard<T>(
  cards: GalleryCard<T>[],
  cardId: string,
  direction: Direction,
): GalleryCard<T>[] | null {
  const from = cards.findIndex((c) => c.id === cardId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= cards.length) return null;
  const moved = [...cards];
  [moved[from], moved[to]] = [moved[to]!, moved[from]!];
  return moved;
}

/** Every photo id in card order, each card's photos together: the new sort order. */
export function photoOrder<T extends { id: string }>(cards: GalleryCard<T>[]): string[] {
  return cards.flatMap((card) => cardPhotos(card).map((photo) => photo.id));
}
