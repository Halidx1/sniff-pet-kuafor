"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useMotionChoice } from "../motion-choice";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll choreography for the homepage story (ADR-025). The markup is server-rendered
 * and passed in as children; this component only finds parts by class name and moves
 * them. Think of it as a controller attached to an existing view.
 *
 * One pinned timeline, scrubbed by the scroll position, in four chapters:
 *   brush → snip → cat → happy
 *
 * Two versions of the same timeline, with the same chapters and pace:
 *  - full: tools travel, fur flies, the cat hops in, the stage zooms;
 *  - gentle (prefers-reduced-motion: reduce, e.g. Windows "Animation effects" off):
 *    things fade and lines draw instead of moving. Nothing flies, slides, zooms or
 *    spins, which is the kind of motion that can make motion-sensitive people dizzy.
 *    Smooth scrolling is off too (smooth-scroll.tsx).
 */
export function StoryAnimator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  // The visitor can ask for the full animation despite reduced motion (MotionToggle).
  const choice = useMotionChoice();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          // GSAP runs this only while at least one condition matches, so every
          // combination must be covered: "reduce" catches phones with reduced motion.
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 64rem)",
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          const gentle = !motion && choice !== "full";
          const q = gsap.utils.selector(root);
          /** The single element matching `sel` inside the story (the markup is ours). */
          const one = (sel: string) => q(sel)[0] as HTMLElement;
          const pin = one(".hs-pin");
          const stage = one(".hs-stage"); // measured (never transformed)
          const frame = one(".hs-frame"); // moved and scaled
          const brush = one(".hs-brush");
          const scissors = one(".hs-scissors");
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
              // Scroll distance per story: longer = slower. Phones were 20 % too fast at 3.6.
              end: () => `+=${innerHeight * (desktop ? 4.2 : 4.5)}`,
              pin: true,
              scrub: gentle ? true : 0.8,
              invalidateOnRefresh: true,
            },
          });

          // ---- helpers: each motion has a gentle twin -------------------------------
          const caption = (i: number) => {
            const all = q(".hs-caption");
            const tilt = i % 2 ? 2 : -2;
            tl.to(all, { autoAlpha: 0, duration: 0.1 }, "<");
            tl.fromTo(
              all[i] as HTMLElement,
              gentle ? { autoAlpha: 0, rotate: tilt } : { autoAlpha: 0, y: 14, rotate: tilt * 2 },
              gentle
                ? { autoAlpha: 1, duration: 0.3 }
                : { autoAlpha: 1, y: 0, rotate: tilt, duration: 0.3 },
              "<0.1",
            );
            q(".hs-rail-step").forEach((step, k) =>
              tl.to(step, { opacity: k <= i ? 1 : 0.25, duration: 0.2 }, "<"),
            );
          };
          /** Rub out the scruffy outline (drawing, not movement: same in both versions). */
          const undraw = (sel: string, duration: number) =>
            tl.to(q(`${sel} .ink`), { strokeDashoffset: 1, duration, stagger: 0.02 }, "<");
          /** Fur leaves: flies off (full) or simply fades (gentle). */
          const away = (targets: Element[], fly: gsap.TweenVars, position: gsap.Position) =>
            tl.to(
              targets,
              gentle
                ? { autoAlpha: 0, duration: fly.duration, stagger: fly.stagger }
                : { ...fly, autoAlpha: 0 },
              position,
            );
          /** A tool arrives: swoops in from `from` (full) or fades in at its spot (gentle). */
          const toolIn = (tool: Element, from: gsap.TweenVars, spot: gsap.TweenVars) => {
            if (gentle) tl.set(tool, spot).to(tool, { autoAlpha: 1, duration: 0.3 });
            else
              tl.fromTo(tool, { ...from, autoAlpha: 0 }, { ...spot, autoAlpha: 1, duration: 0.5 });
          };
          /** A tool works along a path (full); gentle: it holds still for the same time. */
          const work = (tool: Element, vars: gsap.TweenVars, position?: gsap.Position) => {
            if (gentle) tl.to({}, { duration: Number(vars.duration ?? 0.5) }, position);
            else tl.to(tool, vars, position);
          };
          const toolOut = (tool: Element, exit: gsap.TweenVars) =>
            tl.to(
              tool,
              gentle ? { autoAlpha: 0, duration: 0.3 } : { ...exit, autoAlpha: 0, duration: 0.4 },
            );

          // Gentle: the dog already stands where it ends up, so it never has to move;
          // the tools are placed 170 px further left to match.
          const dx = gentle ? -170 : 0;
          if (gentle) gsap.set(q(".hs-dog"), { x: dx });

          // ---- 0. hand over from the hero: copy steps aside, the stage takes centre.
          tl.addLabel("start")
            .to(q(".hs-copy"), {
              autoAlpha: 0,
              x: gentle || !desktop ? 0 : -80,
              y: gentle || desktop ? 0 : -60,
              duration: 0.6,
            })
            .to(q(".hs-hint"), { autoAlpha: 0, duration: 0.2 }, "<");
          if (gentle) {
            // Fade out, jump to the centre while invisible, fade back in: no visible travel.
            tl.to(frame, { autoAlpha: 0, duration: 0.3 }, "<")
              .set(frame, toCentre)
              .to(frame, { autoAlpha: 1, duration: 0.3 });
          } else {
            tl.to(frame, { ...toCentre, duration: 0.8 }, "<");
          }

          // ---- 1. brush: three strokes along the back, strands fly off behind the brush.
          tl.addLabel("brush");
          caption(0);
          toolIn(brush, { x: 120, y: -200, rotate: 25 }, { x: -300 + dx, y: 16, rotate: -8 });
          for (const [from, to] of [
            [-300, -520],
            [-290, -540],
            [-310, -500],
          ]) {
            if (!gentle) tl.set(brush, { x: from, y: 14 });
            work(brush, { x: to, y: 22, rotate: -14, duration: 0.5, ease: "sine.inOut" });
            work(brush, { y: -30, rotate: 0, duration: 0.15 });
          }
          away(
            q(".hs-strand").slice(0, 8).reverse(),
            {
              x: () => rand(-80, -20),
              y: () => rand(-170, -90),
              rotate: () => rand(-120, 120),
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
          if (gentle) tl.set(brush, { x: -200 + dx, y: -92, rotate: 22 });
          work(brush, { x: -240, y: -100, rotate: 18, duration: 0.4 });
          work(brush, { x: -150, y: -84, rotate: 26, duration: 0.5, ease: "sine.inOut" });
          away(
            q(".hs-strand").slice(8, 13),
            {
              x: () => rand(20, 80),
              y: () => rand(-150, -80),
              rotate: () => rand(-90, 90),
              duration: 0.5,
              stagger: 0.08,
            },
            "<",
          );
          undraw(".hs-scruff-head", 0.5);
          toolOut(brush, { x: 140, y: -260, rotate: 40 });

          // ---- 2. snip: scissors trim the long belly fur and the tail.
          tl.addLabel("snip");
          caption(1);
          toolIn(scissors, { x: -140, y: 60, rotate: -8 }, { x: gentle ? 160 + dx : 0, y: 0 });
          work(scissors, { x: 330, duration: 2, ease: "none" }, "snip+=0.4");
          if (!gentle) {
            const snips = (deg: number) => [0, deg, 0, deg, 0, deg, 0, deg, 0, deg, 0, deg, 0];
            tl.to(
              q(".hs-blade-top"),
              { keyframes: { rotate: snips(-24) }, duration: 2 },
              "snip+=0.4",
            );
            tl.to(
              q(".hs-blade-bottom"),
              { keyframes: { rotate: snips(24) }, duration: 2 },
              "snip+=0.4",
            );
          }
          away(
            q(".hs-clump"),
            {
              y: () => rand(150, 220),
              x: () => rand(-20, 20),
              rotate: () => rand(-50, 50),
              duration: 0.5,
              stagger: 0.3,
            },
            "snip+=0.55",
          );
          work(scissors, { x: 100, y: -330, rotate: -30, duration: 0.6 });
          away(
            q(".hs-strand").slice(13),
            {
              y: () => rand(-120, -60),
              x: () => rand(-50, 30),
              rotate: () => rand(-90, 90),
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
          work(q(".hs-dog")[0] as HTMLElement, {
            x: -170,
            keyframes: { y: [0, -16, 0, -16, 0] },
            duration: 1,
          });
          tl.set(q(".hs-cat"), { autoAlpha: 1 }, "<");
          tl.fromTo(
            q(".hs-cat .ink"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1, stagger: 0.01 },
            "<",
          );
          tl.fromTo(q(".hs-cat .paint"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, "<0.4");
          toolIn(
            brush,
            { x: 140, y: -120, rotate: 30 },
            { x: gentle ? -50 : 10, y: -14, rotate: 10 },
          );
          work(brush, { x: -110, y: -12, rotate: -6, duration: 0.6, ease: "sine.inOut" });
          work(brush, { x: 10, y: -16, rotate: 10, duration: 0.5, ease: "sine.inOut" });
          away(
            q(".hs-cat-strand"),
            {
              x: () => rand(-60, 60),
              y: () => rand(-140, -70),
              rotate: () => rand(-100, 100),
              duration: 0.6,
              stagger: 0.08,
            },
            "<-0.6",
          );
          undraw(".hs-scruff-cat", 0.8);
          toolOut(brush, { x: 160, y: -240, rotate: 40 });

          // ---- 4. happy: both close their eyes, sparkles pop.
          tl.addLabel("happy");
          caption(3);
          tl.to(q(".hs-eye-open"), { autoAlpha: 0, duration: 0.15 });
          tl.fromTo(q(".hs-eye-happy"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, "<");
          tl.fromTo(
            q(".hs-sparkle"),
            gentle ? { autoAlpha: 0 } : { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" },
            gentle
              ? { autoAlpha: 1, duration: 0.4, stagger: 0.08 }
              : { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: "back.out(3)" },
          );
          tl.to({}, { duration: 0.6 }); // hold the final picture for a moment
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [choice], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="hs-root">
      {children}
    </div>
  );
}
