import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// Module dependency graph (ADR-001, CLAUDE.md). Every module may also use
// `identity` and `shared`; other edges must be listed here.
const MODULE_DEPENDENCIES = {
  catalog: ["media"],
  booking: ["catalog", "business"],
};

const moduleIndex = (name) => ({
  to: { element: { type: "module", captured: { moduleName: name }, fileInternalPath: "index.ts" } },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "module", pattern: "src/modules/*", capture: ["moduleName"] },
        { type: "shared", pattern: "src/shared" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            // Routes compose modules through their public API only.
            { from: { element: { type: "app" } }, allow: { to: { element: { type: "shared" } } } },
            {
              from: { element: { type: "app" } },
              allow: { to: { element: { type: "module", fileInternalPath: "index.ts" } } },
            },
            // The kernel knows nothing about modules.
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
            },
            // Modules: shared, identity, and the edges listed above.
            {
              from: { element: { type: "module" } },
              allow: { to: { element: { type: "shared" } } },
            },
            { from: { element: { type: "module" } }, allow: moduleIndex("identity") },
            ...Object.entries(MODULE_DEPENDENCIES).flatMap(([from, targets]) =>
              targets.map((target) => ({
                from: { element: { type: "module", captured: { moduleName: from } } },
                allow: moduleIndex(target),
              })),
            ),
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "supabase/.temp/**",
    "public/vendor/**", // MapLibre worker copied from node_modules (ADR-020)
  ]),
]);

export default eslintConfig;
