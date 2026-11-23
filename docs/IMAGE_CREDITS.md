# Image credits

Every image the site uses and where it comes from.

The files live in [`supabase/seed/media/`](../supabase/seed/media/) and are uploaded by `npm run seed:media` (see [`manifest.json`](../supabase/seed/media/manifest.json)). Everything is seeded with `is_demo = true` until the owner confirms it from `/admin`.

## The shop's own material

| File | Used as | Note |
|---|---|---|
| `supabase/seed/media/shop/*-cover.jpg`, `*-before.jpg`, `*-after.jpg` | Gallery: 9 Önce \| Sonra cards (covers in the lightbox) | From the shop's Instagram posts (@sniffpetkuafor). The developer decided on 2026-11-23 that they may be used because the shop already publishes them (ADR-031). Metadata stripped. |
| `supabase/seed/media/shop/kiyafet-01.jpg` … `kiyafet-07.jpg` | Gallery: outfit carousel | Same source and decision. |
| `supabase/seed/media/shop/hero-pomeranian.jpg` | Homepage hero image record | Same source (the Pomeranian post's after photo). |
| `supabase/seed/media/shop/about-tarak.jpg` | About page | Same source (the comb post). |
| `sources/images/brushing.jpg`, `feeding.jpg`, `nailing.jpg` | Instagram preview tiles | Posts from the shop's Instagram. |
| `public/brand/logo-interim.png` | Logo | Extracted from `sources/images/logo_+_coming_soon.png` by `scripts/extract-logo.py` until the original file arrives. |

## Removed stock photos

The 8 Unsplash photos used until 2026-11-23 (hero, About, 6 gallery photos) were replaced by the shop's own photos; `seed:media` deletes their rows and files. Their credits are in this file's git history.

## Map and illustrations

| What | Source | Licence |
|---|---|---|
| Map tiles and style ("positron") on the homepage and `/iletisim` | [OpenFreeMap](https://openfreemap.org), [OpenMapTiles](https://openmaptiles.org), data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) | Free, commercial use allowed; ODbL data. The attribution is shown on the map itself (ADR-020). |
| Map pin, grooming-story dog, cat, brush and scissors | Drawn as inline SVG for this site in the brand colours | Original work in this repository. Not photos, not AI images, not the logo. |
