import { MediaImage, type MediaItem } from "@/modules/media";

// Built on the brand's paw (PawShape, viewBox 0 0 200 200). The frame below shows
// x 22–180, y 14–182 so no toe is clipped; the pad (x 45–157, y 92–180) holds the
// photo through the .paw-pad mask, and the toes are slimmer than in the artwork so
// the photo stays the focus.
export function HeroPaw({ image }: { image: MediaItem | undefined }) {
  return (
    <div className="relative mx-auto aspect-[158/168] w-full max-w-[32rem]">
      <svg
        viewBox="22 14 158 168"
        aria-hidden="true"
        className="absolute inset-0 size-full fill-navy"
      >
        <ellipse cx="44" cy="76" rx="13" ry="19" transform="rotate(-24 44 76)" />
        <ellipse cx="81" cy="44" rx="14" ry="20" transform="rotate(-8 81 44)" />
        <ellipse
          cx="121"
          cy="44"
          rx="14"
          ry="20"
          transform="rotate(8 121 44)"
          className="fill-caramel"
        />
        <ellipse cx="158" cy="76" rx="13" ry="19" transform="rotate(24 158 76)" />
      </svg>
      <div className="paw-pad absolute top-[46.4%] left-[14.6%] h-[52.4%] w-[70.9%] bg-beige">
        {image && (
          <MediaImage
            image={image}
            sizes="(min-width: 1024px) 17rem, 71vw"
            className="size-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
