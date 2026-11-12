import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { GroomScene } from "./groom-scene";
import "./groom-story.css";

type HeroTexts = { hero_title: string; hero_subtitle: string; hero_text: string };

/**
 * Homepage hero as a scroll-driven story (ADR-022). The texts and buttons are plain
 * HTML on the first screen; the illustration beside them animates as the visitor
 * scrolls through the tall .gs-track. Server Component: the animation is pure CSS.
 */
export function GroomStory({ texts }: { texts: HeroTexts }) {
  return (
    // overflow-x-clip (not hidden) clips the walking-in cat without breaking position: sticky.
    <section aria-labelledby="hero-heading" className="overflow-x-clip bg-cream">
      <Container className="gs-grid">
        <div className="gs-copy">
          <h1
            id="hero-heading"
            className="text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            {texts.hero_title}
          </h1>
          <p className="mt-6 font-heading text-xl font-bold">{texts.hero_subtitle}</p>
          <p className="mt-3 max-w-xl text-lg leading-relaxed">{texts.hero_text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/randevu-al">Hemen Randevu Al</ButtonLink>
            <ButtonLink href="/hizmetlerimiz" variant="secondary">
              Hizmetlerimizi Keşfet
            </ButtonLink>
          </div>
        </div>
        <div className="gs-track">
          <div className="gs-stage">
            <GroomScene />
          </div>
        </div>
      </Container>
    </section>
  );
}
