import { describe, expect, it } from "vitest";
import { ablativeSuffix, formatDuration, formatTry } from "./format";

describe("formatTry", () => {
  it.each([
    [1250, "₺1.250"],
    [750, "₺750"],
    [1_000_000, "₺1.000.000"],
    [1250.5, "₺1.250,50"],
    [0, "₺0"],
  ])("%d → %s", (amount, expected) => expect(formatTry(amount)).toBe(expected));
});

describe("ablativeSuffix", () => {
  it.each([
    [1, "'den"], // bir
    [3, "'ten"], // üç
    [4, "'ten"], // dört
    [5, "'ten"], // beş
    [6, "'dan"], // altı
    [9, "'dan"], // dokuz
    [10, "'dan"], // on
    [40, "'tan"], // kırk
    [60, "'tan"], // altmış
    [70, "'ten"], // yetmiş
    [90, "'dan"], // doksan
    [100, "'den"], // yüz
    [250, "'den"], // iki yüz elli
    [600, "'den"], // altı yüz
    [1000, "'den"], // bin
    [1250, "'den"], // bin iki yüz elli
    [1300, "'den"], // bin üç yüz
    [1340, "'tan"], // bin üç yüz kırk
    [2000, "'den"], // iki bin
    [1_000_000, "'dan"], // bir milyon
    [0, "'dan"], // sıfır
    [1250.5, "'den"], // … elli kuruş
    [99.05, "'ten"], // … beş kuruş
  ])("%d → %s", (amount, expected) => expect(ablativeSuffix(amount)).toBe(expected));
});

describe("formatDuration", () => {
  it.each([
    [15, "15 dakika"],
    [60, "1 saat"],
    [90, "1 saat 30 dakika"],
    [180, "3 saat"],
  ])("%d → %s", (minutes, expected) => expect(formatDuration(minutes)).toBe(expected));
});
