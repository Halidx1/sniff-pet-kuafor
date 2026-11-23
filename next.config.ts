import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Only the production deploy sets SITE_INDEXABLE=true (netlify.toml); previews and local stay out of search engines.
const indexable = process.env.SITE_INDEXABLE === "true";

// Baseline CSP for the public site. Static/prerendered pages can't carry per-request nonces, so inline
// scripts are allowed here; /admin gets its own strict nonce-based CSP from proxy.ts (ADR-006), so
// this one is not sent there (two CSP headers would both be enforced).
// Images come from our own Supabase project only (ADR-008/009). The map (ADR-020) fetches its
// style, tiles and fonts from OpenFreeMap and runs MapLibre's worker from /vendor (same origin).
const supabaseOrigin = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "frame-src 'none'",
  "font-src 'self'",
  "connect-src 'self' https://tiles.openfreemap.org",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Everything except /admin and /admin/… (proxy.ts sets the admin CSP).
      {
        source: "/:path((?!admin$|admin/).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
