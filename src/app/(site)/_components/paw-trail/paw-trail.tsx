import type { LucideIcon } from "lucide-react";
import { Doodle } from "../doodles/doodle";
import { doodles } from "../doodles/doodles.data";
import "./paw-trail.css";

export type Reason = { icon: LucideIcon; title: string; text: string };

/**
 * The "why us" points as hand-drawn paw prints walking down the page (issue #64).
 * Server Component: the paws are inline SVG, the step-in is a CSS scroll-driven
 * animation (no JavaScript); without support or with reduced motion they're simply there.
 */
export function PawTrail({ reasons }: { reasons: Reason[] }) {
  return (
    <ol className="paw-trail">
      {reasons.map(({ icon: Icon, title, text }, i) => (
        <li
          key={title}
          className="paw-step"
          style={{ "--tilt": `${i % 2 ? 3 : -3}deg` } as React.CSSProperties}
        >
          {/* Toes above the pad, kept in proportion. */}
          <svg viewBox="0 0 240 112" aria-hidden="true" className="paw-toes">
            <Doodle paths={doodles.paw.toes} />
          </svg>
          <div className="paw-body">
            {/* The pad stretches to fit the text; line widths stay constant. */}
            <svg
              viewBox="16 88 208 142"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 size-full"
            >
              <Doodle paths={doodles.paw.pad} stretch />
            </svg>
            <div className="relative flex flex-col items-center px-[13%] pt-[13%] pb-[15%] text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-caramel text-navy">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-balance">{title}</h3>
              <p className="mt-2 leading-relaxed">{text}</p>
            </div>
          </div>
          {/* A small print between steps, like the next footstep. */}
          {i < reasons.length - 1 && (
            <svg viewBox="0 0 60 60" aria-hidden="true" className="paw-print">
              <Doodle paths={doodles.accents.paw} />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}
