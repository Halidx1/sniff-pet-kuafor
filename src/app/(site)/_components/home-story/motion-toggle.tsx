"use client";

import { useEffect } from "react";
import { setMotionChoice, useMotionChoice, type MotionChoice } from "../motion-choice";

/** Replays the page-load moment (headline stickers, the dog drawing itself). */
function replayIntro() {
  const hero = document.querySelector(".hs");
  if (!hero) return;
  hero.classList.remove("hs-play");
  void (hero as HTMLElement).offsetWidth; // force a style recalc so the animations restart
  hero.classList.add("hs-play");
}

/** Back to the top of the story, so it starts from the beginning in its new version. */
function restart(choice: MotionChoice) {
  window.scrollTo({ top: 0, behavior: "instant" });
  setMotionChoice(choice);
  if (choice === "full") replayIntro();
}

/**
 * Shown only when the system asks for reduced motion (home-story.css). Visitors may not
 * know their setting is on (Windows "Animation effects" off is a common default) and
 * could take the gentle story for a weak website, so they can choose the full one:
 * the story restarts from the top with the animated headline. Switching back restarts
 * it in the gentle version, with the headline simply shown.
 */
export function MotionToggle() {
  const choice = useMotionChoice();
  const full = choice === "full";

  // A reload with "full" remembered: the headline appeared without animation (the
  // reduced-motion rule was active until the page ran), so play it once now.
  useEffect(() => {
    if (full && matchMedia("(prefers-reduced-motion: reduce)").matches) replayIntro();
    // Only on first mount; clicks replay it themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      className="hs-motion-toggle"
      onClick={() => restart(full ? "auto" : "full")}
    >
      {!full && (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
          <path
            d="M8 5.5v13l10.5-6.5z"
            fill="currentColor"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      )}
      {full ? "Sade animasyona dön" : "Animasyonu tam hızda oynat"}
    </button>
  );
}
