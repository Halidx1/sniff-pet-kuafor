"use client";

import { useSyncExternalStore } from "react";

// "Arms" the scroll effects (story timeline, smooth scrolling) on the visitor's first
// interaction instead of right after load (issue #64, Lighthouse). Their starting
// picture is plain CSS, so nothing visible changes until then; loading GSAP and
// pinning the story at load cost ~0.7 s of main-thread time on a mid-range phone.
// Like lazy initialisation in Java: the expensive object is built on first use.

const EVENTS = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
let armed = false;
const listeners = new Set<() => void>();

function arm() {
  if (armed) return;
  armed = true;
  for (const type of EVENTS) window.removeEventListener(type, arm, true);
  for (const notify of listeners) notify();
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (!armed) {
    // Opened mid-page (reload, back button): the effects are needed right away.
    if (window.scrollY > 0) queueMicrotask(arm);
    else
      for (const type of EVENTS)
        window.addEventListener(type, arm, { capture: true, passive: true });
  }
  return () => listeners.delete(notify);
}

/** False until the visitor first scrolls, touches, clicks or presses a key. */
export function useFirstInteraction() {
  return useSyncExternalStore(
    subscribe,
    () => armed,
    () => false,
  );
}

/** GSAP + ScrollTrigger, loaded once, on demand (keeps ~110 KB out of the first load). */
let gsapPromise: Promise<{
  gsap: typeof import("gsap").default;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
}> | null = null;
export function loadGsap() {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    },
  );
  return gsapPromise;
}
