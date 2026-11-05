---
name: slides
description: Adding or changing an event deck under /slides — the self-contained HTML decks in public/slides/<slug>/, the manifest in lib/slides.ts, covers, and the rules a deck must follow to run both from devsa.community and offline from disk. Use when building a deck for a DEVSA event or editing one.
---

# Event decks (/slides)

`/slides` lists the decks DEVSA presents at its events; each one runs at
`/slides/<slug>`. A deck is **one self-contained folder**:

```
public/slides/<slug>/
  index.html     the whole deck: markup, styles and script in one file
  cover.jpg      its title slide, 1280x720, shown on /slides
  assets/        everything it loads (fonts, logos, video, QR codes)
```

`app/slides/[slug]/route.ts` serves that `index.html` at `/slides/<slug>`, so a
deck gets no navbar or footer and owns the screen. The route adds a `<base>`
pointing at the deck's folder, builds each deck once at deploy time, and 404s any
slug not listed in `DECKS` in `lib/slides.ts`, which is also what `/slides` lists.

## Adding a deck

1. Copy the most recent deck's folder to `public/slides/<new-slug>/` and
   rewrite its slides. Slugs are lowercase words and dashes, with the event and
   date: `community-roundtable-nov12`. Never rename one that has been shared.
2. Keep the head of `index.html` as it is (see "Rules" below).
3. Make `cover.jpg`: open the deck at 1920x1080 on its title slide, screenshot,
   scale to 1280x720 JPEG (about 100 KB).
4. Add an entry to `DECKS` in `lib/slides.ts`: title, one-line summary, date,
   where, slide count, the event page if there is one.
5. Open `/slides` and the deck in `pnpm dev`, then `pnpm build`. Each deck
   page is generated at build time from `DECKS`, so it goes live with the deploy.

## Rules a deck must follow

**It must run from disk.** Venue wifi fails. Every asset is in the deck's own
folder, loaded by a relative path (`assets/...`): no CDN, no Google Fonts, no
absolute `/` paths. Fonts are woff2 copies from `node_modules/geist/dist/fonts`.
Anything live (the Discord member count) fetches with a timeout and falls back
to a value written in the file.

**Don't add a `<base>` yourself.** The route adds one when it serves the deck,
and from disk the relative paths already work. Because of that base, anything
that writes the URL must keep the path:
`history.replaceState(null, "", location.pathname + "#" + n)`, never `"#" + n`,
which would resolve against the deck's folder.

**Keep `<meta name="robots" content="noindex">`.** Decks are made for a room,
sometimes before what they announce is public. `/slides/` is also disallowed in
`app/robots.ts`, and the `/slides` page itself is noindex.

**Design it for a TV.** The stage is a fixed 1920x1080, scaled to fit the
screen. Body text no smaller than ~27px at that size, headings 88px and up.
It follows the site's design system (load the `design-system` skill): the
sans eyebrow, the black h2 with a light italic muted clause at `white/50`,
the `neutral-800`/`neutral-900` card. Never put readable text below `white/50`.

**Controls are the same in every deck,** so whoever presents doesn't have to
learn them: → / Space / Page Down / click for next, ← / Page Up for back,
F for full screen, Home to start over, the slide number in the URL hash.
Clickers send Page Up/Down.

**Claims follow the site's rules.** The same voice and honesty rules apply
as on the site: claim only what DEVSA does; quote partners in their own
words; confirm any partner's logo use and wording (TVSA, Geekdom) before
it goes on a screen.

## The roundtable deck's network

`community-roundtable-nov12` draws the community network live (same geometry
as `components/community-network.tsx`) with logos copied into its own
`assets/logos/`. The roundtable slide spotlights one group per click; `G`
opens a picker. Groups are the `GROUPS` array in the deck's script, which is
the place to change who appears. It does not read `/api/communities`, on
purpose, so it still works offline.
