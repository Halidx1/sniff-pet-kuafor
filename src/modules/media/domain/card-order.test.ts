import { describe, expect, it } from "vitest";
import { moveCard, photoOrder } from "./card-order";
import { toGalleryCards, type Groupable } from "./gallery-cards";

const photo = (id: string, group?: string, role?: Groupable["group_role"]): Groupable => ({
  id,
  group_id: group ?? null,
  group_role: role ?? null,
  category: null,
});

// a | pair(b-before, d-after) | c   (d sorts after c but belongs to b's card)
const cards = toGalleryCards([
  photo("a"),
  photo("b", "g", "before"),
  photo("c"),
  photo("d", "g", "after"),
]);

describe("moveCard", () => {
  it("swaps a card with its neighbour", () => {
    expect(moveCard(cards, "c", "up")!.map((c) => c.id)).toEqual(["a", "c", "g"]);
    expect(moveCard(cards, "a", "down")!.map((c) => c.id)).toEqual(["g", "a", "c"]);
  });
  it("can't move past either end, or an unknown card", () => {
    expect(moveCard(cards, "a", "up")).toBeNull();
    expect(moveCard(cards, "c", "down")).toBeNull();
    expect(moveCard(cards, "x", "up")).toBeNull();
  });
});

describe("photoOrder", () => {
  it("keeps each card's photos together", () => {
    expect(photoOrder(cards)).toEqual(["a", "b", "d", "c"]);
    expect(photoOrder(moveCard(cards, "g", "down")!)).toEqual(["a", "c", "b", "d"]);
  });
});
