// MapLibre runs its tile parsing in a Web Worker loaded from a separate file. Bundlers
// don't ship that file, so we copy it to public/ before dev and build (ADR-020).
// Output is git-ignored; it is rebuilt from the exact npm version every time.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const target = join(root, "public/vendor/maplibre-gl-worker.js");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log("Copied the MapLibre worker to public/vendor/");
