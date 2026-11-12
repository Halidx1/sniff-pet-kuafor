"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll choreography for the homepage story (ADR-025). The markup is server-rendered
 * and passed in as children; this component only finds parts by class name and moves
 * them. Think of it as a controller attached to an existing view.
 *
 * One pinned timeline, scrubbed by the scroll position, in four chapters:
 *   brush → snip → cat → happy
 * With reduced motion nothing here runs; home-story.css shows the finished picture.
 */
export function StoryAnimator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 64rem)" },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;
          const q = gsap.utils.selector(root);
          /** The single element matching `sel` inside the story (the markup is ours). */
          const one = (sel: string) => q(sel)[0] as HTMLElement;
          const pin = one(".hs-pin");
          const stage = one(".hs-stage"); // measured (never transformed)
          const frame = one(".hs-frame"); // moved and scaled
          const rand = gsap.utils.random;

          // Offset that brings the stage to the middle of the screen (below the header)
          // once the pin is active. Measured relative to the pin box, so it doesn't
          // matter how far the page is scrolled when ScrollTrigger refreshes.
          const header = desktop ? 80 : 64;
          const toCentre = {
            x: () => {
              const s = stage.getBoundingClientRect();
              const p = pin.getBoundingClientRect();
              return p.width / 2 - (s.left - p.left + s.width / 2);
            },
            y: () => {
              const s = stage.getBoundingClientRect();
              const p = pin.getBoundingClientRect();
              return header + (innerHeight - header) / 2 - (s.top - p.top + s.height / 2);
            },
            // As large as fits: ~80 % of the width on desktop, the full width on phones
            // (the final frame needs room for both pets), within ~85 % of the height.
            scale: () => {
              const s = stage.getBoundingClientRect();
              const byWidth = (innerWidth * (desktop ? 0.8 : 0.98)) / s.width;
              const byHeight = ((innerHeight - header) * 0.85) / s.height;
              return Math.min(byWidth, byHeight);
            },
          };

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${innerHeight * (desktop ? 4.2 : 3.6)}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          const caption = (i: number) => {
            const all = q(".hs-caption");
            tl.to(all, { autoAlpha: 0, y: -10, duration: 0.1 }, "<");
            tl.fromTo(
              all[i] as HTMLElement,
              { autoAlpha: 0, y: 14, rotate: i % 2 ? 4 : -4 },
              { autoAlpha: 1, y: 0, rotate: i % 2 ? 2 : -2, duration: 0.3 },
              "<0.1",
            );
            q(".hs-rail-step").forEach((step, k) =>
              tl.to(step, { opacity: k <= i ? 1 : 0.25, duration: 0.2 }, "<"),
            );
          };
          const undraw = (sel: string, duration: number) =>
            tl.to(q(`${sel} .ink`), { strokeDashoffset: 1, duration, stagger: 0.02 }, "<");

          // ---- 0. hand over from the hero: copy steps aside, the stage takes centre.
          tl.addLabel("start")
            .to(q(".hs-copy"), {
              autoAlpha: 0,
              x: desktop ? -80 : 0,
              y: desktop ? 0 : -60,
              duration: 0.6,
            })
            .to(q(".hs-hint"), { autoAlpha: 0, duration: 0.2 }, "<")
            .to(frame, { ...toCentre, duration: 0.8 }, "<");

          // ---- 1. brush: three strokes along the back, strands fly off behind the brush.
          tl.addLabel("brush");
          caption(0);
          const brush = one(".hs-brush");
          tl.fromTo(
            brush,
            { x: 120, y: -200, rotate: 25, autoAlpha: 0 },
            { x: -300, y: 16, rotate: -8, autoAlpha: 1, duration: 0.5 },
          );
          for (const [from, to] of [
            [-300, -520],
            [-290, -540],
            [-310, -500],
          ]) {
            tl.fromTo(
              brush,
              { x: from, y: 14 },
              { x: to, y: 22, rotate: -14, duration: 0.5, ease: "sine.inOut" },
            );
            tl.to(brush, { y: -30, rotate: 0, duration: 0.15 });
          }
          const backStrands = q(".hs-strand").slice(0, 8).reverse();
          tl.to(
            backStrands,
            {
              x: () => rand(-80, -20),
              y: () => rand(-170, -90),
              rotate: () => rand(-120, 120),
              autoAlpha: 0,
              duration: 0.6,
              stagger: 0.18,
            },
            "brush+=0.6",
          );
          tl.to(
            q(".hs-scruff-body .ink"),
            { strokeDashoffset: 1, duration: 1.6, stagger: 0.04 },
            "brush+=0.6",
          );
          // over the head
          tl.to(brush, { x: -240, y: -100, rotate: 18, duration: 0.4 });
          tl.to(brush, { x: -150, y: -84, rotate: 26, duration: 0.5, ease: "sine.inOut" });
          tl.to(
            q(".hs-strand").slice(8, 13),
            {
              x: () => rand(20, 80),
              y: () => rand(-150, -80),
              rotate: () => rand(-90, 90),
              autoAlpha: 0,
              duration: 0.5,
              stagger: 0.08,
            },
            "<",
          );
          undraw(".hs-scruff-head", 0.5);
          tl.to(brush, { x: 140, y: -260, rotate: 40, autoAlpha: 0, duration: 0.4 });

          // ---- 2. snip: scissors trim the long belly fur and the tail.
          tl.addLabel("snip");
          caption(1);
          const scissors = one(".hs-scissors");
          tl.fromTo(
            scissors,
            { x: -140, y: 60, autoAlpha: 0, rotate: -8 },
            { x: 0, y: 0, autoAlpha: 1, duration: 0.4 },
          );
          tl.to(scissors, { x: 330, duration: 2, ease: "none" }, "snip+=0.4");
          tl.to(
            q(".hs-blade-top"),
            {
              keyframes: { rotate: [0, -24, 0, -24, 0, -24, 0, -24, 0, -24, 0, -24, 0] },
              duration: 2,
            },
            "snip+=0.4",
          );
          tl.to(
            q(".hs-blade-bottom"),
            { keyframes: { rotate: [0, 24, 0, 24, 0, 24, 0, 24, 0, 24, 0, 24, 0] }, duration: 2 },
            "snip+=0.4",
          );
          tl.to(
            q(".hs-clump"),
            {
              y: () => rand(150, 220),
              x: () => rand(-20, 20),
              rotate: () => rand(-50, 50),
              autoAlpha: 0,
              duration: 0.5,
              stagger: 0.3,
            },
            "snip+=0.55",
          );
          tl.to(scissors, { x: 100, y: -330, rotate: -30, duration: 0.6 });
          tl.to(
            q(".hs-strand").slice(13),
            {
              y: () => rand(-120, -60),
              x: () => rand(-50, 30),
              rotate: () => rand(-90, 90),
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.06,
            },
            "<",
          );
          undraw(".hs-scruff-tail", 0.4);
          tl.to(scissors, { autoAlpha: 0, duration: 0.2 });

          // ---- 3. cat: the dog steps aside, the cat draws itself in and gets brushed.
          tl.addLabel("cat");
          caption(2);
          tl.to(q(".hs-dog"), { x: -170, keyframes: { y: [0, -16, 0, -16, 0] }, duration: 1 });
          tl.set(q(".hs-cat"), { autoAlpha: 1 }, "<");
          tl.fromTo(
            q(".hs-cat .ink"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1, stagger: 0.01 },
            "<",
          );
          tl.fromTo(q(".hs-cat .paint"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, "<0.4");
          tl.fromTo(
            brush,
            { x: 140, y: -120, rotate: 30, autoAlpha: 0 },
            { x: 10, y: -14, rotate: 10, autoAlpha: 1, duration: 0.4 },
          );
          tl.to(brush, { x: -110, y: -12, rotate: -6, duration: 0.6, ease: "sine.inOut" });
          tl.to(brush, { x: 10, y: -16, rotate: 10, duration: 0.5, ease: "sine.inOut" });
          tl.to(
            q(".hs-cat-strand"),
            {
              x: () => rand(-60, 60),
              y: () => rand(-140, -70),
              rotate: () => rand(-100, 100),
              autoAlpha: 0,
              duration: 0.6,
              stagger: 0.08,
            },
            "<-0.6",
          );
          undraw(".hs-scruff-cat", 0.8);
          tl.to(brush, { x: 160, y: -240, rotate: 40, autoAlpha: 0, duration: 0.4 });

          // ---- 4. happy: both close their eyes, sparkles pop.
          tl.addLabel("happy");
          caption(3);
          tl.to(q(".hs-eye-open"), { autoAlpha: 0, duration: 0.15 });
          tl.fromTo(q(".hs-eye-happy"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, "<");
          tl.fromTo(
            q(".hs-sparkle"),
            { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" },
            { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: "back.out(3)" },
          );
          tl.to({}, { duration: 0.6 }); // hold the final picture for a moment
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="hs-root">
      {children}
    </div>
  );
}
