---
name: design-system
description: The site's type scale, spacing, color-contrast floors and the two eyebrow idioms. Load before adding or restyling a marketing section, or when a section looks out of step with the ones around it.
---

# Design system

There was no written one. Every section hardcoded its own class strings, so
consistency was maintained by copy-paste — and the failure mode is copying from
the wrong page. That is exactly how the homepage's conferences section ended up
with an eyebrow a size smaller and in a different typeface from its neighbours:
it was built out of `/events` and inherited that page's idiom.

Measured on the homepage before this was written: **six different eyebrow
definitions** and **five different h2 definitions**, on one page.

## Two eyebrow idioms, and they are not interchangeable

**Marketing pages** — homepage, `/buildingtogether`. Sans, and bigger than you
think:

```
text-sm md:text-base font-medium uppercase tracking-[0.2em]
```

Used by EcosystemShowcase, AudienceLanes, HeroCommunities, DevsaConferences,
HowWeHelp.

**Event and brand pages** — `/events`, the four conference routes. Mono, small,
because mono *is* the brand grammar there (Access Granted's terminal prompts,
The Model's labels):

```
font-mono text-[11px] uppercase tracking-widest
```

Do not bring the mono form onto a marketing page. It reads as a different, and
smaller, system.

## The h2 ramp

Marketing sections run the full four steps. Dropping `xl:text-7xl` makes a
heading render one size below its neighbours above 1280px, which is subtle
enough to ship and obvious once seen:

```
text-balance font-sans leading-[0.95] font-black tracking-[-0.02em]
text-4xl md:text-5xl lg:text-6xl xl:text-7xl
```

The muted clause inside a heading is `font-light italic` at `text-white/50` on
dark (`text-gray-400`-ish on light). It is a span inside the h2, never a
separate element.

## Section padding

`py-16 md:py-24` is the marketing default (AboutDevsa adds `lg:py-28`; it is the
page's opening statement and earns it). Eyebrow to h2 is `mt-5`.

## Cards

One shape, used by AudienceLanes, the `/events` portfolio and the homepage
conferences grid. Inventing a different geometry for a new section is what makes
it read as pasted in:

```
group block h-full overflow-hidden rounded-2xl border border-neutral-800
bg-neutral-900 transition-all duration-200
  hover:border-neutral-700 hover:bg-neutral-900/70

  ├ visual slot   aspect-16/10 w-full overflow-hidden   (photo, or a brand mark)
  └ content       flex flex-1 flex-col gap-4 p-6
                  body (flex-1) · meta · CTA with ArrowUpRight
```

Grid: `grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (or
`md:grid-cols-3` for three).

## Color contrast floors

WCAG AA: **4.5:1** for body and small text, **3:1** for large text (24px+, or
19px+ bold) and for graphical objects.

White-on-dark alpha minimums, measured — not guessed:

| ground | minimum alpha for 4.5:1 |
|---|---|
| `#0a0a0a` (section) | **0.46** |
| `#171717` (neutral-900 card) | **0.46** |

So `text-white/50` is the lowest safe step for anything readable, and
`text-white/45` fails at 4.48:1 on both grounds — close enough to look fine and
still be wrong.

`text-white/40` and below are **decoration only** — rules, dividers, inactive
marks. Never body copy, labels, metadata or captions.

There are still around 74 uses of `text-white/25` through `/45` across the app
predating this note. Not all are text; audit before changing one.

## Checking a color

Do not eyeball it. The relative-luminance formula, with white composited over
the ground at the alpha in question:

```python
def lum(h):
    h = h.lstrip('#'); r, g, b = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
```

## Typefaces

Geist Sans everywhere, Geist Mono for the mono idiom, both via `next/font`.

**In pages**, Oswald is only Access Granted's wordmark — one `font-display`
class in the repo, on that one `h1`.

**In OG cards** it is the display face for all five conference cards, while
DEVSA's own pages stay in Geist so they read as the site rather than as an
event. Satori cannot use `next/font` — it needs the bytes — so those cards load
TTFs from `lib/og-fonts/` through `loadDisplayFonts()`, not the CSS variable.

Reach the faces through `font-sans` / `font-mono`, which resolve through
`--font-sans` / `--font-mono` to the `next/font` variables. Never write a literal
family name: `next/font` registers hashed names, so `"Geist Sans"` only matches
for a reader who has Geist installed as a system font. That bug shipped once.
