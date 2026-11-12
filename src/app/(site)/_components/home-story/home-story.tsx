import { ButtonLink } from "@/shared/ui/button";
import { Doodle } from "../doodles/doodle";
import { doodles } from "../doodles/doodles.data";
import { StoryAnimator } from "./story-animator";
import { StoryScene } from "./story-scene";
import "./home-story.css";

type HeroTexts = { hero_title: string; hero_subtitle: string; hero_text: string };

// Narration for the four chapters. Describes the drawing only (no service claims);
// listed for the owner's approval in the needs-owner issue.
const CAPTIONS = [
  "Önce güzelce bir tarayalım.",
  "Uçları biraz toparlayalım.",
  "Şimdi sıra kedimizde.",
  "Tertemiz ve mutlu!",
];

// A small tilt per headline word, like stickers slapped on paper.
const TILTS = [-4, 3, -2, 4, -3, 2, -1, 3];

/**
 * Homepage hero as a hand-drawn grooming story (SPEC §8, ADR-025).
 * Server-rendered: texts, buttons and the doodle SVG are plain HTML/SVG. StoryAnimator
 * (client) pins this section and scrubs the chapters with the scroll position.
 */
export function HomeStory({ texts }: { texts: HeroTexts }) {
  const words = texts.hero_title.split(/\s+/).filter(Boolean);
  return (
    <section aria-labelledby="hero-heading" className="hs">
      <StoryAnimator>
        <div className="hs-pin">
          <div className="hs-copy">
            <h1 id="hero-heading" className="hs-title">
              {words.map((word, i) => (
                <span
                  key={i}
                  className="hs-word"
                  style={
                    { "--tilt": `${TILTS[i % TILTS.length]}deg`, "--i": i } as React.CSSProperties
                  }
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="hs-sub mt-6 font-heading text-xl font-bold">{texts.hero_subtitle}</p>
            <p className="hs-sub mt-3 max-w-xl text-lg leading-relaxed">{texts.hero_text}</p>
            <div className="hs-sub mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/randevu-al">Hemen Randevu Al</ButtonLink>
              <ButtonLink href="/hizmetlerimiz" variant="secondary">
                Hizmetlerimizi Keşfet
              </ButtonLink>
            </div>
          </div>

          <div className="hs-stage">
            <div className="hs-frame">
              <StoryScene />
              <ol className="hs-captions" aria-hidden="true">
                {CAPTIONS.map((caption) => (
                  <li key={caption} className="hs-caption">
                    {caption}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ol className="hs-rail" aria-hidden="true">
            {CAPTIONS.map((caption) => (
              <li key={caption} className="hs-rail-step">
                <svg viewBox="0 0 60 60">
                  <Doodle paths={doodles.accents.paw} />
                </svg>
              </li>
            ))}
          </ol>

          <div className="hs-hint" aria-hidden="true">
            <svg viewBox="0 0 60 60">
              <Doodle paths={doodles.accents.paw} />
            </svg>
          </div>
        </div>
      </StoryAnimator>
    </section>
  );
}
