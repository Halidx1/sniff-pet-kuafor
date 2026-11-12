import { useSyncExternalStore } from "react";

/**
 * The visitor's own motion choice, on top of the system setting (ADR-025).
 * "auto" follows prefers-reduced-motion; "full" plays the full animation even when the
 * system asks for reduced motion (the visitor pressed "Animasyonu tam hızda oynat").
 * Kept in localStorage: a per-visitor convenience, so failures just mean "auto".
 */
export type MotionChoice = "auto" | "full";

const KEY = "sniff-motion";
const listeners = new Set<() => void>();

function read(): MotionChoice {
  try {
    return localStorage.getItem(KEY) === "full" ? "full" : "auto";
  } catch {
    return "auto";
  }
}

/**
 * Marks <html data-motion="full"> so CSS treats the page like normal motion: the global
 * reduced-motion rule in globals.css steps aside and page-load animations run.
 */
export function applyMotionChoice(choice: MotionChoice) {
  if (choice === "full") document.documentElement.dataset.motion = "full";
  else delete document.documentElement.dataset.motion;
}

export function setMotionChoice(choice: MotionChoice) {
  applyMotionChoice(choice);
  try {
    if (choice === "full") localStorage.setItem(KEY, "full");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode etc.): the choice lasts until the page is left.
  }
  current = choice;
  listeners.forEach((listener) => listener());
}

let current: MotionChoice | undefined;
const snapshot = () => (current ??= read());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The current choice; "auto" on the server and during hydration. */
export function useMotionChoice(): MotionChoice {
  return useSyncExternalStore(subscribe, snapshot, () => "auto");
}
