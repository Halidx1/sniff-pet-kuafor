import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "./markdown";

const t = (text: string) => ({ text, bold: false });
const b = (text: string) => ({ text, bold: true });

describe("parseInline", () => {
  it("splits bold segments", () => {
    expect(parseInline("Her **dostumuz** özeldir")).toEqual([
      t("Her "),
      b("dostumuz"),
      t(" özeldir"),
    ]);
  });

  it("leaves unmatched or empty markers as text", () => {
    expect(parseInline("**yarım")).toEqual([t("**yarım")]);
    expect(parseInline("a ** b")).toEqual([t("a ** b")]);
  });
});

describe("parseMarkdown", () => {
  it("reads headings, paragraphs and lists", () => {
    const md =
      "# Biz Kimiz?\n\nİlk satır\nikinci satır\n\n- Bir\n- **İki**\n\n### Alt başlık\n1. Önce\n2) Sonra";
    expect(parseMarkdown(md)).toEqual([
      { type: "heading", level: 2, content: [t("Biz Kimiz?")] },
      { type: "paragraph", content: [t("İlk satır ikinci satır")] },
      { type: "list", ordered: false, items: [[t("Bir")], [b("İki")]] },
      { type: "heading", level: 3, content: [t("Alt başlık")] },
      { type: "list", ordered: true, items: [[t("Önce")], [t("Sonra")]] },
    ]);
  });

  it("starts a new block when a list follows a paragraph line directly, and vice versa", () => {
    expect(parseMarkdown("Giriş\n- madde\nSon")).toEqual([
      { type: "paragraph", content: [t("Giriş")] },
      { type: "list", ordered: false, items: [[t("madde")]] },
      { type: "paragraph", content: [t("Son")] },
    ]);
  });

  it("keeps HTML as visible text (never markup)", () => {
    expect(parseMarkdown('<script>alert("x")</script>')).toEqual([
      { type: "paragraph", content: [t('<script>alert("x")</script>')] },
    ]);
  });

  it("handles Windows line endings and empty input", () => {
    expect(parseMarkdown("a\r\n\r\nb")).toHaveLength(2);
    expect(parseMarkdown("")).toEqual([]);
  });
});
