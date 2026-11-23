import { Container } from "./container";

type Tone = "plain" | "cream" | "navy";

// Cream and navy bands get torn-paper edges in their own colour (--band); plain
// and cream bands a light paper grain (globals.css, issue #64).
const TONES: Record<Tone, string> = {
  plain: "paper bg-neutral-bg text-navy",
  cream: "paper torn bg-cream text-navy [--band:var(--color-cream)]",
  navy: "torn bg-navy text-cream [--band:var(--color-navy)]",
};

/** A full-width page band. Alternating tones give the page its rhythm. */
export function Section({
  tone = "plain",
  id,
  labelledBy,
  className = "",
  children,
}: {
  tone?: Tone;
  id?: string;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONES[tone]} py-16 sm:py-24 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  id,
  title,
  intro,
}: {
  id: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2
        id={id}
        className="pen-underline text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {intro && <p className="mt-4 text-[1.0625rem] leading-relaxed">{intro}</p>}
    </div>
  );
}

/** The h1 band at the top of every inner page. */
export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="paper torn bg-cream pt-12 pb-10 [--band:var(--color-cream)] before:hidden sm:pt-16 sm:pb-14">
      <Container>
        <h1 className="pen-underline max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed">{intro}</p>}
      </Container>
    </div>
  );
}
