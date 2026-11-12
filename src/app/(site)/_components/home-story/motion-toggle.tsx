"use client";

import { setMotionChoice, useMotionChoice } from "../motion-choice";

/**
 * Shown only when the system asks for reduced motion (home-story.css). Visitors may not
 * know their setting is on (Windows "Animation effects" off is a common default) and
 * could take the gentle story for a weak website, so they can choose the full one.
 */
export function MotionToggle() {
  const choice = useMotionChoice();
  const full = choice === "full";
  return (
    <button
      type="button"
      className="hs-motion-toggle"
      onClick={() => setMotionChoice(full ? "auto" : "full")}
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
