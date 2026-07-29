---
name: og-image
description: Building Open Graph / social share card routes under app/api/og/ using next/og ImageResponse, the DEVSA brand helpers in lib/og-brand.tsx, and the bundled Geist fonts in lib/og-fonts.ts. Use when adding a share card for a new page or event, or debugging a card that renders with wrong fonts, missing layout, or a blank image.
---

# OG image routes

Cards live at `app/api/og/<name>/route.tsx` (note: `.tsx`, they return JSX) and render at 1200×630 via `next/og`'s `ImageResponse`.

## Skeleton

```tsx
import { ImageResponse } from "next/og"
import { BrandGradientBar, DevsaLogoMark } from "@/lib/og-brand"
import { loadBrandFonts } from "@/lib/og-fonts"

export const runtime = "nodejs"

export async function GET() {
  const fonts = await loadBrandFonts()
  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column",
                    backgroundColor: "#ffffff", fontFamily: "Geist Sans" }}>
        <BrandGradientBar direction="ltr" />
        {/* content */}
        <BrandGradientBar direction="rtl" />
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
```

`app/api/og/home/route.tsx` is the reference implementation — copy its structure for a new static card.

## Constraints that bite

**`runtime = "nodejs"` is required.** The font loader reads TTFs off disk with `node:fs/promises`; the edge runtime can't. Cards that render blank or 500 usually lost this export.

**Every element needs an explicit `display`.** Satori — the renderer behind `ImageResponse` — does not apply CSS defaults. A `<div>` with children and no `display: "flex"` renders nothing. This is the most common cause of a card that's mysteriously empty.

**Fonts must be passed in, not requested.** `loadBrandFonts()` returns Geist Sans at weights 400/500/700/800; `loadBrandMonoFonts()` returns Geist Mono at 400/500/600. Both are read from `lib/og-fonts/*.ttf` via `import.meta.url` so Next traces them into the serverless bundle — don't rewrite those paths as string literals or the fonts vanish in production. Both loaders memoize per-instance.

Only the loaded weights exist. `fontWeight: 600` on a Geist Sans card silently falls back — use 500 or 700, or add the TTF to the loader.

**Layout is flexbox only.** No grid, no float. Use flex, explicit widths, and `gap`.

## Brand helpers

From `lib/og-brand.tsx`:

- `BrandGradientBar({ direction })` — the gradient rule; convention is `ltr` at the top, `rtl` at the bottom
- `DevsaLogoMark({ size })` — inline SVG logo
- `BRAND_GRADIENT`, `BRAND_GRADIENT_REVERSE`, `BRAND_GRADIENT_STOPS`, `LOGO_COLORS`

Accent pink is `#ef426f`. Body/muted greys in use: `#111827`, `#6b7280`, `#9ca3af`.

## Dynamic cards

For per-record cards (`og/event/[slug]`, `og/buildingtogether/[slug]`, `og/shop/[productId]`), fetch the record inside the handler and always render something — a missing document should produce a generic branded card, not a 500. A broken share image is worse than a plain one.

Remote images must be absolute URLs on hosts allow-listed in `next.config.ts`.

## Wiring it up

Point the page's metadata at the route:

```ts
export const metadata = {
  openGraph: { images: ["/api/og/your-card"] },
}
```

Use absolute `https://www.devsa.community/...` URLs where a crawler needs them — `www` is the canonical host.

## Checking your work

`pnpm dev`, then open `http://localhost:3000/api/og/your-card` directly in a browser — the route renders the PNG on its own, no social-preview tool needed.
