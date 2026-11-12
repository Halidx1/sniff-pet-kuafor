import { parseMarkdown, type Inline } from "@/shared/lib/markdown";

// Renders the Markdown subset as React elements: text is escaped by React and
// there is no dangerouslySetInnerHTML (CLAUDE.md security rules).
export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={className}>
      {parseMarkdown(source).map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return <Tag key={i}>{renderInline(block.content)}</Tag>;
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{renderInline(block.content)}</p>;
      })}
    </div>
  );
}

function renderInline(content: Inline[]) {
  return content.map((part, i) => (part.bold ? <strong key={i}>{part.text}</strong> : part.text));
}
