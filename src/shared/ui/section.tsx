import { Container } from "./container";

type Tone = "plain" | "cream" | "navy";

const TONES: Record<Tone, string> = {
  plain: "bg-sky text-navy",
  cream: "bg-cream text-navy",
  navy: "bg-navy text-cream",
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
      <h2 id={id} className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-[1.0625rem] leading-relaxed">{intro}</p>}
    </div>
  );
}

/** The h1 band at the top of every inner page. */
export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="bg-cream pt-12 pb-10 sm:pt-16 sm:pb-14">
      <Container>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed">{intro}</p>}
      </Container>
    </div>
  );
}
