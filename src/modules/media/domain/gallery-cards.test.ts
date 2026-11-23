import { describe, expect, it } from "vitest";
import {
  cardCategory,
  cardPhotos,
  toGalleryCards,
  type Groupable,
  type GroupRole,
} from "./gallery-cards";

const img = (
  id: string,
  group_id: string | null = null,
  group_role: GroupRole | null = null,
  category: "cat" | "dog" | null = "dog",
): Groupable => ({ id, group_id, group_role, category });

describe("toGalleryCards", () => {
  it("makes a pair from before + after, keeping the cover for the lightbox", () => {
    const cards = toGalleryCards([
      img("c", "g", "cover"),
      img("b", "g", "before"),
      img("a", "g", "after"),
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      kind: "pair",
      id: "g",
      before: { id: "b" },
      after: { id: "a" },
      cover: { id: "c" },
    });
    expect(cardPhotos(cards[0]!).map((p) => p.id)).toEqual(["c", "b", "a"]);
  });

  it("makes a pair without a cover", () => {
    const [card] = toGalleryCards([img("a", "g", "after"), img("b", "g", "before")]);
    expect(card).toMatchObject({ kind: "pair", cover: null });
    expect(cardPhotos(card!).map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("makes a carousel from slides, in the owner's order", () => {
    const [card] = toGalleryCards([
      img("1", "g", "slide"),
      img("2", "g", "slide"),
      img("3", "g", "slide"),
    ]);
    expect(card!.kind).toBe("carousel");
    expect(cardPhotos(card!).map((p) => p.id)).toEqual(["1", "2", "3"]);
  });

  it("turns a group with slides next to before/after into a carousel, roles first", () => {
    const [card] = toGalleryCards([
      img("s", "g", "slide"),
      img("a", "g", "after"),
      img("b", "g", "before"),
    ]);
    expect(card!.kind).toBe("carousel");
    expect(cardPhotos(card!).map((p) => p.id)).toEqual(["b", "a", "s"]);
  });

  it("shows an incomplete group with one photo as a single", () => {
    const [card] = toGalleryCards([img("b", "g", "before")]);
    expect(card).toMatchObject({ kind: "single", image: { id: "b" } });
  });

  it("keeps ungrouped images as singles, in order of each card's first image", () => {
    const cards = toGalleryCards([
      img("x"),
      img("b", "g", "before"),
      img("y"),
      img("a", "g", "after"),
    ]);
    expect(cards.map((c) => [c.kind, c.id])).toEqual([
      ["single", "x"],
      ["pair", "g"],
      ["single", "y"],
    ]);
  });

  it("returns nothing for no images", () => {
    expect(toGalleryCards([])).toEqual([]);
  });
});

describe("cardCategory", () => {
  it("is the first photo's category", () => {
    const [cat, dog] = toGalleryCards([
      img("k", null, null, "cat"),
      img("d", "g", "slide", "dog"),
      img("e", "g", "slide", "dog"),
    ]);
    expect(cardCategory(cat!)).toBe("cat");
    expect(cardCategory(dog!)).toBe("dog");
  });
});
