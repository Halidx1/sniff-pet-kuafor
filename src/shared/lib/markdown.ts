// A deliberately tiny Markdown subset for owner-edited texts (PLAN A11): headings,
// paragraphs, bullet and numbered lists, **bold**. It returns plain data, so the
// renderer never injects HTML: anything that looks like a tag stays visible text.

export type Inline = { text: string; bold: boolean };
export type Block =
  | { type: "heading"; level: 2 | 3; content: Inline[] }
  | { type: "paragraph"; content: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] };

export function parseInline(text: string): Inline[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    );
}

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;

  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: "paragraph", content: parseInline(paragraph.join(" ")) });
    if (list) blocks.push({ type: "list", ...list });
    paragraph = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const ordered = NUMBERED.test(line);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      // A page already has its own h1, so "#" and "##" both become h2.
      blocks.push({
        type: "heading",
        level: heading[1]!.length === 3 ? 3 : 2,
        content: parseInline(heading[2]!),
      });
    } else if (BULLET.test(line) || ordered) {
      if (paragraph.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(parseInline(line.replace(ordered ? NUMBERED : BULLET, "")));
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
