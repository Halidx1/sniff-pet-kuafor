# Image credits

Every image the site uses that isn't the shop's own. Stock photos are demo content (`is_demo = true`) that the owner replaces from `/admin`; they never represent the shop, its staff or its customers (CLAUDE.md).

The files live in [`supabase/seed/media/`](../supabase/seed/media/) and are uploaded by `npm run seed:media` (see [`manifest.json`](../supabase/seed/media/manifest.json)).

## Stock photos

All are free to use under the [Unsplash License](https://unsplash.com/license) (commercial use allowed, no attribution required; credited anyway). Downloaded 2026-11-11 at 1600 px width.

| File | Used as | Published by default | Photographer | Source |
|---|---|---|---|---|
| `hero-pomeranian-towel.jpg` | Homepage hero | Yes (decoration) | Hayffield L | https://unsplash.com/photos/ZVdZw2p08y4 |
| `about-poodle-scissors.jpg` | About page | No | Buddy AN | https://unsplash.com/photos/LpK2xddrElI |
| `gallery-cat-petted.jpg` | Gallery | No | Paul Hanaoka | https://unsplash.com/photos/C0zDWAPFT9A |
| `gallery-dog-running.jpg` | Gallery | No | Joe Caione | https://unsplash.com/photos/qO-PIF84Vxg |
| `gallery-cat-persian-grooming.jpg` | Gallery | No | Reba Spike | https://unsplash.com/photos/PEQIIwnIGdo |
| `gallery-dog-puppy.jpg` | Gallery | No | T.R Photography | https://unsplash.com/photos/TzjMd7i5WQI |
| `gallery-cat-grey.jpg` | Gallery | No | Milada Vigerova | https://unsplash.com/photos/aR-eWYIEaOQ |
| `gallery-dog-bandana.jpg` | Gallery | No | Karsten Winegeart | https://unsplash.com/photos/_hoAqzp39tk |

Gallery and About photos stay unpublished: on those pages a stock photo could be mistaken for the shop's own work or staff. The owner publishes real photos instead.

## The shop's own material

| File | Used as | Note |
|---|---|---|
| `sources/images/brushing.jpg`, `feeding.jpg`, `nailing.jpg` | Instagram preview tiles only (demo, published) | Posts from the shop's Instagram. Original source unknown; they may be AI-generated. Never used as hero or gallery photos (SPEC §6). |
| `public/brand/logo-interim.png` | Logo | Extracted from `sources/images/logo_+_coming_soon.png` by `scripts/extract-logo.py` until the original file arrives. |
