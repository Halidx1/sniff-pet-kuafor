import { Doodle, DoodleSet } from "../doodles/doodle";
import { doodles } from "../doodles/doodles.data";

const { dog, cat, brush, scissors } = doodles;

/**
 * The grooming scene (viewBox 0 0 1000 700). Every animated part is its own group with
 * an hs-* class; story-animator.tsx moves them, story.css sets the static states.
 * Order = paint order: far legs behind the body, belly fur behind the near legs, etc.
 */
export function StoryScene() {
  return (
    <svg viewBox="0 0 1000 700" className="hs-scene" aria-hidden="true" focusable="false">
      <g className="hs-dog">
        <Doodle paths={dog.shadow} className="hs-shadow" />
        <Doodle paths={dog.tail} />
        <Doodle paths={dog.scruffTail} className="hs-scruff hs-scruff-tail" />
        <Doodle paths={dog.tailPom} />
        <Doodle paths={dog.legsFar} />
        <Doodle paths={dog.body} />
        <DoodleSet items={dog.clumps} className="hs-clump" />
        <Doodle paths={dog.legsNear} />
        <Doodle paths={dog.scruffBody} className="hs-scruff hs-scruff-body" />
        <Doodle paths={dog.bandana} />
        <Doodle paths={dog.head} />
        <Doodle paths={dog.scruffHead} className="hs-scruff hs-scruff-head" />
        <Doodle paths={dog.ear} />
        <Doodle paths={dog.snout} />
        <Doodle paths={dog.nose} />
        <Doodle paths={dog.mouth} />
        <Doodle paths={dog.eyeOpen} className="hs-eye-open" />
        <Doodle paths={dog.eyeHappy} className="hs-eye-happy" />
        <DoodleSet items={dog.strands} className="hs-strand" />
        <DoodleSet items={dog.sparkles} className="hs-sparkle" />
      </g>

      <g className="hs-cat">
        <Doodle paths={cat.shadow} className="hs-shadow" />
        <Doodle paths={cat.tail} />
        <Doodle paths={cat.body} />
        <Doodle paths={cat.legs} />
        <Doodle paths={cat.earLeft} />
        <Doodle paths={cat.earRight} />
        <Doodle paths={cat.head} />
        <Doodle paths={cat.scruffHead} className="hs-scruff hs-scruff-cat" />
        <Doodle paths={cat.eyeOpen} className="hs-eye-open" />
        <Doodle paths={cat.eyeHappy} className="hs-eye-happy" />
        <Doodle paths={cat.nose} />
        <Doodle paths={cat.whiskers} />
        <DoodleSet items={cat.strands} className="hs-cat-strand" />
        <DoodleSet items={cat.sparkles} className="hs-sparkle" />
      </g>

      {/* Tools are drawn around their own origin; the outer translate parks them. */}
      <g transform="translate(860 300)">
        <g className="hs-brush">
          <Doodle paths={brush} />
        </g>
      </g>
      <g transform="translate(300 560)">
        <g className="hs-scissors">
          <Doodle paths={scissors.bottom} className="hs-blade hs-blade-bottom" />
          <Doodle paths={scissors.top} className="hs-blade hs-blade-top" />
          <Doodle paths={scissors.pivot} />
        </g>
      </g>
    </svg>
  );
}
