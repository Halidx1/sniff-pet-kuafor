import { CalendarCheck, Heart, MapPin, PawPrint, type LucideIcon } from "lucide-react";
import type { MediaItem } from "@/modules/media";
import { Container } from "@/shared/ui/container";
import { HeroPaw } from "../hero-paw";

const REASONS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Heart,
    title: "Özenli Bakım",
    text: "Her bakımı acele etmeden, dostunuzun rahatını gözeterek yaparız.",
  },
  {
    icon: PawPrint,
    title: "Kedi ve Köpeklere Özel Yaklaşım",
    text: "Kedilerin ve köpeklerin ihtiyaçları farklıdır; bakımı dostunuzun türüne ve karakterine göre planlarız.",
  },
  {
    icon: CalendarCheck,
    title: "Randevulu Hizmet",
    text: "Randevuyla çalışırız; böylece size ve dostunuza ayrılan zaman bellidir.",
  },
  {
    icon: MapPin,
    title: "Gölbaşı'nda Kolay Ulaşım",
    text: "Gaziosmanpaşa Mahallesi'ndeyiz. Yol tarifi için sayfanın altındaki haritaya göz atabilirsiniz.",
  },
];

/**
 * A text card shaped like a paw print: four small toes above a pad. The pad (.paw-pad
 * mask) stretches with its content; the toes keep their shape. Toe coordinates are in
 * pad units: the pad is 112 wide and starts at y = 0. `caramelToe` picks the accent toe.
 */
function PawCard({
  children,
  tilt,
  caramelToe,
  className = "",
}: {
  children: React.ReactNode;
  tilt: number;
  caramelToe: 0 | 1 | 2 | 3;
  className?: string;
}) {
  const toes: [number, number, number][] = [
    [6, -4, -24],
    [34, -30, -8],
    [78, -30, 8],
    [106, -4, 24],
  ];
  return (
    <div
      className={`gs-paw ${className}`}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      {/* viewBox -10..122 × -50..16: 132 units wide = 117.9 % of the pad; the 16 units
          below the pad's top edge are pulled under it with a negative margin (-14.3 %). */}
      <svg
        viewBox="-10 -50 132 66"
        aria-hidden="true"
        className="relative left-[-8.9%] mb-[-14.3%] block w-[117.9%] max-w-none"
      >
        {toes.map(([cx, cy, angle], i) => (
          <ellipse
            key={cx}
            cx={cx}
            cy={cy}
            rx="12"
            ry="17"
            transform={`rotate(${angle} ${cx} ${cy})`}
            className={i === caramelToe ? "fill-caramel" : "fill-cream"}
          />
        ))}
      </svg>
      <div className="relative flex aspect-[112/88] flex-col justify-center">
        <div className="paw-pad absolute inset-0 bg-cream" />
        <div className="relative px-[15%] pt-[24%] pb-[17%] text-center">{children}</div>
      </div>
    </div>
  );
}

/**
 * After the grooming story: the welcome text and the "why us" points, each inside
 * a paw print, alternating like footsteps (SPEC §8). Reveal animations are CSS only
 * and switch off with reduced motion (groom-story.css).
 */
export function PawTrail({
  welcomeText,
  heroImage,
}: {
  welcomeText: string;
  heroImage: MediaItem | undefined;
}) {
  return (
    <section aria-labelledby="welcome-heading" className="overflow-x-clip py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div
            className="gs-paw mx-auto w-full max-w-sm"
            style={{ "--tilt": "-4deg" } as React.CSSProperties}
          >
            <HeroPaw image={heroImage} />
          </div>
          <PawCard tilt={2} caramelToe={2} className="mx-auto w-full max-w-xl">
            <h2
              id="welcome-heading"
              className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl"
            >
              Sniff Pet Kuaför&apos;e Hoş Geldiniz!
            </h2>
            <p className="mt-3 leading-relaxed sm:text-lg">{welcomeText}</p>
          </PawCard>
        </div>

        <h2
          id="reasons-heading"
          className="mt-20 text-center text-3xl font-extrabold tracking-tight text-balance sm:mt-28 sm:text-4xl"
        >
          Minik Dostlarınız İçin Özenli Bakım
        </h2>
        <ul className="mx-auto mt-12 grid max-w-4xl gap-y-6 sm:grid-cols-2 sm:gap-x-12">
          {REASONS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className={i % 2 === 0 ? "sm:pb-24" : "sm:pt-24"}>
              <PawCard
                tilt={i % 2 === 0 ? -3 : 3}
                caramelToe={(i % 4) as 0 | 1 | 2 | 3}
                className={`w-[88%] max-w-sm ${i % 2 === 0 ? "me-auto sm:mx-auto" : "ms-auto sm:mx-auto"}`}
              >
                <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-caramel text-navy">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-lg leading-snug font-extrabold sm:text-xl">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed">{text}</p>
              </PawCard>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
