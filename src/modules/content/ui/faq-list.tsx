import { ChevronDown } from "lucide-react";

/** Native <details> accordion: keyboard and screen-reader friendly without JavaScript (ADR-013). */
export function FaqList({ items }: { items: { id: string; question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-beige rounded-3xl bg-sky-light">
      {items.map((item) => (
        <details key={item.id} className="group px-6">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              className="size-5 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-[65ch] pb-5 leading-relaxed">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
