"""Extract an interim transparent logo from the "coming soon" artwork.

Usage (one-off, needs Python 3 + Pillow):
    python3 scripts/extract-logo.py sources/images/logo_+_coming_soon.png public/brand/logo-interim.png

The logo is a single navy colour on light (cream/beige) backgrounds, so each pixel's opacity can
be derived from how dark it is. Every pixel keeps the logo's own navy; nothing is redrawn,
recoloured or vectorised. Replace the output once the original logo file is supplied.
"""

import sys

from PIL import Image

LOGO_NAVY = (0x15, 0x25, 0x43)  # sampled from the artwork's darkest, most common pixels
REGION = (150, 250, 1200, 800)  # wordmark + "PET KUAFÖR"; excludes "COMING SOON" and below
BG_LUMA = 0.78  # both background tones (#DFD3BD paw, #E8DCC8 cream) are lighter than this
NAVY_LUMA = (0.2126 * LOGO_NAVY[0] + 0.7152 * LOGO_NAVY[1] + 0.0722 * LOGO_NAVY[2]) / 255
PADDING = 8


def opacity(r: int, g: int, b: int) -> float:
    luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return min(1.0, max(0.0, (BG_LUMA - luma) / (BG_LUMA - NAVY_LUMA)))


def main(src: str, dst: str) -> None:
    region = Image.open(src).convert("RGB").crop(REGION)
    out = Image.new("RGBA", region.size)
    out.putdata([(*LOGO_NAVY, round(opacity(*px) * 255)) for px in region.getdata()])

    left, top, right, bottom = out.getbbox()  # bounding box of non-transparent pixels
    out = out.crop(
        (
            max(0, left - PADDING),
            max(0, top - PADDING),
            min(out.width, right + PADDING),
            min(out.height, bottom + PADDING),
        )
    )
    out.save(dst, optimize=True)
    print(f"wrote {dst} ({out.width}x{out.height})")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
