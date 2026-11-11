// Small decorative SVGs that lucide-react doesn't ship. Always aria-hidden: the
// surrounding link or button carries the accessible name.

/** Generic outline of the Instagram glyph (lucide no longer includes brand icons). */
export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The paw shape from the brand's coming-soon artwork, used as a background accent. */
export function PawShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className} fill="currentColor">
      <ellipse cx="46" cy="78" rx="17" ry="24" transform="rotate(-24 46 78)" />
      <ellipse cx="82" cy="46" rx="18" ry="26" transform="rotate(-8 82 46)" />
      <ellipse cx="120" cy="46" rx="18" ry="26" transform="rotate(8 120 46)" />
      <ellipse cx="156" cy="78" rx="17" ry="24" transform="rotate(24 156 78)" />
      <path d="M101 92c-26 0-56 30-56 58 0 20 16 30 32 26 10-3 16-8 24-8s14 5 24 8c16 4 32-6 32-26 0-28-30-58-56-58z" />
    </svg>
  );
}
