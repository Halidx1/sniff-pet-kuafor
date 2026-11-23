// Generates the hand-drawn doodles for the homepage story (ADR-025).
//
//   node scripts/doodles/generate-doodles.mjs
//
// Each part of the scene is described below as simple shapes (ellipses, curves, paths).
// rough.js (dev-only) turns them into sketchy, hand-drawn SVG paths with a fixed seed,
// so the output is the same every run. The result is a plain data module that the site
// renders as inline SVG: rough.js itself never ships to visitors.
//
// Coordinates: the story scene uses viewBox 0 0 1000 700; the dog stands centre-left,
// the cat sits on the right. Small doodles (paw, underline, star) have their own boxes.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import rough from "roughjs/bundled/rough.esm.js";

const INK = "#07152b";
const PAPER = "#f5e1ce";
const LIGHT = "#faf6f1";
const FUR = "#c98a4b";
const SHADOW = "#e9d8c6";

const gen = rough.generator();
let seed = 11;

/** Base style: navy ink, slightly wobbly, double stroke like a quick pen sketch. */
const ink = (extra = {}) => ({
  seed: seed++,
  stroke: INK,
  strokeWidth: 3,
  roughness: 1.3,
  bowing: 1.1,
  ...extra,
});
const solid = (fill, extra = {}) => ink({ fill, fillStyle: "solid", ...extra });
const hatch = (fill, extra = {}) =>
  ink({ fill, fillStyle: "hachure", hachureGap: 7, fillWeight: 2, hachureAngle: -41, ...extra });

/** rough drawable → [{ d, stroke, strokeWidth, fill }] with short numbers. */
function paths(drawable) {
  return gen.toPaths(drawable).map((p) => ({
    d: p.d.replace(/(\d+\.\d)\d+/g, "$1"),
    stroke: p.stroke === "none" ? undefined : p.stroke,
    strokeWidth: p.stroke === "none" ? undefined : +(+p.strokeWidth).toFixed(1),
    fill: p.fill && p.fill !== "none" ? p.fill : undefined,
  }));
}
const part = (...drawables) => drawables.flatMap(paths);

// Deterministic jitter for scribbly fur.
let r = 7;
const rand = () => (r = (r * 16807) % 2147483647) / 2147483647;
const jitter = (amount) => (rand() - 0.5) * 2 * amount;

/** A loose strand of fur sticking out from (x, y) in direction `angle` (degrees). */
function strand(x, y, angle, length) {
  const a = (angle * Math.PI) / 180;
  const bend = jitter(0.6);
  const pts = [0, 0.5, 1].map((t) => [
    x + Math.cos(a + bend * t) * length * t + jitter(2),
    y + Math.sin(a + bend * t) * length * t + jitter(2),
  ]);
  return part(gen.curve(pts, ink({ strokeWidth: 2.6, roughness: 1 })));
}

/** A zigzag clump of long fur hanging down from (x, y). */
function clump(x, y, width, length) {
  const n = 3;
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) {
    const x0 = x + (width / n) * i;
    d += ` L${x0 + width / n / 2 + jitter(3)} ${y + length * (0.75 + rand() * 0.35)} L${x0 + width / n} ${y}`;
  }
  return part(gen.path(d + " Z", solid(LIGHT, { strokeWidth: 2.6, roughness: 1.1 })));
}

/** Points around an ellipse with random spikes: a messy, unbrushed silhouette. */
function scruff(cx, cy, rx, ry, from, to, count, spike) {
  const pts = [];
  for (let i = 0; i <= count * 2; i++) {
    const t = from + ((to - from) * i) / (count * 2);
    const a = (t * Math.PI) / 180;
    const k = i % 2 ? 1 + spike * (0.6 + rand() * 0.7) : 1;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return part(gen.linearPath(pts, ink({ strokeWidth: 2.6, roughness: 1.6 })));
}

function star(x, y, s, fill = FUR) {
  const q = s * 0.22;
  const d = `M${x} ${y - s} Q${x + q} ${y - q} ${x + s} ${y} Q${x + q} ${y + q} ${x} ${y + s} Q${x - q} ${y + q} ${x - s} ${y} Q${x - q} ${y - q} ${x} ${y - s} Z`;
  return part(gen.path(d, solid(fill, { strokeWidth: 2.2, roughness: 0.8 })));
}

const leg = (x, y, w = 46, h = 120) =>
  part(
    gen.path(
      `M${x} ${y} L${x} ${y + h - 18} Q${x} ${y + h} ${x + 18} ${y + h} L${x + w + 8} ${y + h} Q${x + w + 14} ${y + h - 14} ${x + w} ${y + h - 22} L${x + w} ${y}`,
      solid(PAPER),
    ),
  );

// ---------------------------------------------------------------- dog (facing right)
const dog = {
  shadow: part(gen.ellipse(470, 620, 430, 34, { ...solid(SHADOW), stroke: "none", seed: seed++ })),
  tail: part(
    gen.curve(
      [
        [318, 392],
        [262, 352],
        [250, 290],
        [272, 248],
      ],
      ink({ strokeWidth: 9, roughness: 0.9 }),
    ),
  ),
  tailPom: part(gen.circle(274, 236, 50, solid(PAPER))),
  legsFar: [...leg(352, 470), ...leg(560, 470)],
  body: part(gen.ellipse(470, 420, 340, 190, solid(PAPER))),
  legsNear: [...leg(396, 480), ...leg(606, 480)],
  bandana: part(gen.path("M585 352 L700 342 L652 418 Z", hatch(FUR))),
  head: part(gen.circle(628, 282, 170, solid(PAPER))),
  ear: part(
    gen.path(
      "M590 228 C552 236 548 318 566 360 C578 386 610 372 612 338 C616 298 618 250 590 228 Z",
      hatch(FUR),
    ),
  ),
  snout: part(gen.ellipse(712, 306, 104, 72, solid(PAPER))),
  nose: part(gen.ellipse(758, 288, 30, 22, solid(INK, { roughness: 0.6 }))),
  mouth: part(
    gen.curve(
      [
        [712, 328],
        [728, 340],
        [748, 334],
      ],
      ink({ strokeWidth: 2.6 }),
    ),
  ),
  eyeOpen: part(gen.circle(652, 262, 15, solid(INK, { roughness: 0.4 }))),
  eyeHappy: part(
    gen.curve(
      [
        [638, 266],
        [652, 254],
        [666, 266],
      ],
      ink({ strokeWidth: 3.4, roughness: 0.6 }),
    ),
  ),
  // Before grooming: a spiky outline over the back and head, plus loose strands.
  scruffBody: scruff(470, 420, 178, 102, 190, 345, 13, 0.16),
  scruffHead: scruff(628, 282, 90, 90, 170, 330, 9, 0.2),
  scruffTail: scruff(274, 236, 30, 30, 0, 360, 8, 0.45),
};
dog.strands = [
  [320, 360, -150, 40],
  [348, 334, -130, 46],
  [384, 318, -112, 42],
  [420, 310, -96, 50],
  [458, 306, -88, 44],
  [496, 308, -80, 48],
  [532, 314, -68, 42],
  [560, 324, -58, 40],
  [560, 214, -120, 44],
  [598, 196, -100, 48],
  [640, 192, -78, 46],
  [678, 206, -56, 42],
  [700, 236, -30, 38],
  [250, 220, -140, 30],
  [270, 202, -95, 32],
  [298, 214, -45, 30],
].map(([x, y, a, l]) => strand(x, y, a, l));
// Long belly fur, trimmed by the scissors (left to right).
dog.clumps = [
  [360, 498, 46, 58],
  [404, 504, 44, 64],
  [448, 508, 46, 60],
  [494, 508, 44, 66],
  [538, 504, 46, 58],
  [582, 496, 42, 54],
].map(([x, y, w, l]) => clump(x, y, w, l));
// After grooming: a neat pompom tail and sparkles.
dog.sparkles = [star(232, 180, 18), star(760, 200, 14), star(520, 250, 11)];

// ---------------------------------------------------------------- cat (sitting, facing left)
const cat = {
  shadow: part(gen.ellipse(820, 622, 250, 26, { ...solid(SHADOW), stroke: "none", seed: seed++ })),
  tail: part(
    gen.curve(
      [
        [880, 600],
        [950, 592],
        [962, 520],
        [930, 486],
      ],
      ink({ strokeWidth: 9, roughness: 0.9 }),
    ),
  ),
  body: part(
    gen.path("M742 612 C722 520 746 430 812 422 C878 430 904 520 884 612 Z", solid(PAPER)),
  ),
  legs: part(
    gen.path("M772 612 L776 520", ink({ strokeWidth: 3 })),
    gen.path("M818 612 L816 528", ink({ strokeWidth: 3 })),
    gen.ellipse(778, 610, 52, 24, solid(PAPER)),
    gen.ellipse(822, 610, 52, 24, solid(PAPER)),
  ),
  earLeft: part(
    gen.path("M752 340 L742 262 L800 306 Z", solid(PAPER)),
    gen.path("M758 324 L752 284 L784 308 Z", hatch(FUR, { hachureGap: 5 })),
  ),
  earRight: part(
    gen.path("M832 302 L888 262 L880 344 Z", solid(PAPER)),
    gen.path("M846 304 L878 282 L874 328 Z", hatch(FUR, { hachureGap: 5 })),
  ),
  head: part(gen.circle(812, 364, 150, solid(PAPER))),
  eyeOpen: part(
    gen.circle(782, 354, 13, solid(INK, { roughness: 0.4 })),
    gen.circle(836, 354, 13, solid(INK, { roughness: 0.4 })),
  ),
  eyeHappy: part(
    gen.curve(
      [
        [770, 358],
        [782, 348],
        [794, 358],
      ],
      ink({ strokeWidth: 3.2, roughness: 0.6 }),
    ),
    gen.curve(
      [
        [824, 358],
        [836, 348],
        [848, 358],
      ],
      ink({ strokeWidth: 3.2, roughness: 0.6 }),
    ),
  ),
  nose: part(gen.path("M802 378 L822 378 L812 390 Z", solid(FUR, { roughness: 0.5 }))),
  whiskers: part(
    gen.line(796, 392, 748, 384, ink({ strokeWidth: 2 })),
    gen.line(796, 400, 750, 406, ink({ strokeWidth: 2 })),
    gen.line(828, 392, 876, 384, ink({ strokeWidth: 2 })),
    gen.line(828, 400, 874, 406, ink({ strokeWidth: 2 })),
  ),
  scruffHead: scruff(812, 364, 76, 76, 140, 400, 12, 0.2),
};
cat.strands = [
  [740, 340, -170, 36],
  [744, 392, 170, 36],
  [886, 340, -10, 36],
  [884, 392, 10, 36],
  [862, 448, -20, 40],
  [880, 490, -5, 38],
  [748, 452, -160, 40],
  [744, 494, -175, 36],
].map(([x, y, a, l]) => strand(x, y, a, l));
cat.sparkles = [star(720, 260, 15), star(930, 300, 18), star(950, 440, 11)];

// ---------------------------------------------------------------- tools
// Brush: drawn around its own origin (bristle tips centre) so it can rotate in place.
const brush = part(
  gen.path("M40 -46 L130 -112 L146 -94 L60 -30 Z", hatch(FUR, { hachureGap: 6 })),
  gen.rectangle(-80, -60, 160, 40, solid(PAPER)),
  ...Array.from({ length: 11 }, (_, i) =>
    gen.line(-70 + i * 14, -20, -70 + i * 14, -2, ink({ strokeWidth: 2.4, roughness: 0.6 })),
  ),
);
// Scissors: pivot at the origin, blades to the right, rings to the left.
const blade = (sign) =>
  part(
    gen.path(
      `M0 ${-4 * sign} L118 ${-16 * sign} Q126 ${-9 * sign} 118 ${-3 * sign} L0 ${6 * sign} Z`,
      solid(LIGHT, { roughness: 0.8 }),
    ),
    gen.line(0, 0, -36, -18 * sign, ink({ strokeWidth: 6, roughness: 0.6 })),
    gen.circle(-52, -26 * sign, 34, hatch(FUR, { hachureGap: 5, roughness: 0.8 })),
  );
const scissors = {
  top: blade(1),
  bottom: blade(-1),
  pivot: part(gen.circle(0, 0, 10, solid(INK, { roughness: 0.3 }))),
};

// ---------------------------------------------------------------- small doodles
// Paw print for text cards: viewBox 0 0 240 230 (pad 20..220 × 80..225).
const paw = {
  toes: part(
    gen.ellipse(44, 80, 46, 62, solid(PAPER)),
    gen.ellipse(96, 40, 50, 66, solid(PAPER)),
    gen.ellipse(148, 40, 50, 66, hatch(FUR)),
    gen.ellipse(198, 80, 46, 62, solid(PAPER)),
  ),
  pad: part(
    gen.path(
      "M120 92 C76 92 20 138 20 182 C20 214 48 228 76 220 C96 214 106 206 120 206 C134 206 144 214 164 220 C192 228 220 214 220 182 C220 138 164 92 120 92 Z",
      solid(PAPER),
    ),
  ),
};
// Hand-drawn underline for headings: viewBox 0 0 300 24.
const underline = part(
  gen.curve(
    [
      [6, 16],
      [80, 9],
      [160, 13],
      [230, 7],
      [294, 12],
    ],
    ink({ strokeWidth: 3.2, roughness: 1.4, stroke: FUR }),
  ),
);
// Little accents: viewBox 0 0 60 60.
const accents = {
  star: star(30, 30, 22),
  paw: part(
    gen.ellipse(16, 22, 12, 16, solid(INK, { roughness: 0.5 })),
    gen.ellipse(28, 12, 12, 16, solid(INK, { roughness: 0.5 })),
    gen.ellipse(40, 12, 12, 16, solid(INK, { roughness: 0.5 })),
    gen.ellipse(52, 22, 12, 16, solid(INK, { roughness: 0.5 })),
    gen.path(
      "M34 28 C22 28 12 38 12 46 C12 54 20 56 26 54 C30 52 32 50 34 50 C36 50 38 52 42 54 C48 56 56 54 56 46 C56 38 46 28 34 28 Z",
      solid(INK, { roughness: 0.5 }),
    ),
  ),
};

const data = { dog, cat, brush, scissors, paw, underline, accents };
const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/app/(site)/_components/doodles/doodles.data.ts",
);
const header = `// GENERATED by scripts/doodles/generate-doodles.mjs. Do not edit by hand; change the
// generator and run it again. Hand-drawn paths (rough.js) for the homepage story (ADR-025).
/* prettier-ignore */
`;
writeFileSync(
  out,
  `${header}export type DoodlePath = { d: string; stroke?: string; strokeWidth?: number; fill?: string };\n` +
    `export const doodles = ${JSON.stringify(data)} as const;\n`,
);
console.log("wrote", out, Math.round(JSON.stringify(data).length / 1024), "KB");
