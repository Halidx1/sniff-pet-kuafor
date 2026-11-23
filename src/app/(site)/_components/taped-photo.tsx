import { MediaImage, type MediaItem } from "@/modules/media";

/**
 * A photo print taped to the page, slightly tilted (issue #64). Used for the shop's
 * hero photo next to the welcome text. Decoration only: the image keeps its alt text.
 */
export function TapedPhoto({ image, className = "" }: { image: MediaItem; className?: string }) {
  return (
    <figure
      className={`relative mx-auto w-[85%] max-w-sm -rotate-3 sm:w-full bg-white p-3 pb-12 shadow-[0_18px_40px_-18px_rgb(7_21_43/0.45)] ${className}`}
    >
      <MediaImage
        image={image}
        sizes="(min-width: 1024px) 22rem, 80vw"
        className="aspect-square w-full object-cover"
      />
      <span aria-hidden="true" className="tape -top-3 -left-4 -rotate-[28deg]" />
      <span aria-hidden="true" className="tape -top-3 -right-4 rotate-[32deg]" />
    </figure>
  );
}
