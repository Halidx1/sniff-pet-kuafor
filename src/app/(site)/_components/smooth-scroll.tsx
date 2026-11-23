"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { loadGsap, useFirstInteraction } from "./first-interaction";
import { applyMotionChoice, useMotionChoice } from "./motion-choice";

/**
 * Smooth, slightly weighted scrolling for the public site (ADR-025), driven by GSAP's
 * clock so pinned story chapters and the scroll position never drift apart.
 * Off with reduced motion, unless the visitor chose the full animation (MotionToggle);
 * touch scrolling stays native. Dialogs and other scrollable panels opt out with
 * data-lenis-prevent. Lenis and GSAP load on the first interaction (first-interaction.ts).
 */
export function SmoothScroll() {
  const choice = useMotionChoice();
  // Also covers a reload with "full" remembered: the marker is set once the page runs.
  useEffect(() => applyMotionChoice(choice), [choice]);
  const armed = useFirstInteraction();
  useEffect(() => {
    if (!armed) return;
    if (choice !== "full" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let cleanup = () => {};
    void Promise.all([loadGsap(), import("lenis")]).then(
      ([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
        if (cancelled) return;
        const lenis = new Lenis({ lerp: 0.12, anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      },
    );
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [armed, choice]);
  return null;
}
