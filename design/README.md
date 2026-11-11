# design/

DEVSA's own design sources, kept so the next graphic starts from these rather than from
scratch. Not part of the site: nothing here is built or served. Brought in from the
`~/Downloads/tv-socials` working folder on 2026-11-05.

| | |
|---|---|
| `devsa-tv/` | the **>TV** mark: the DEVSA mark redrawn as a clapperboard (open, closed, square icon) as SVG and PNG, and the 2.4 s clap (MP4, 16:9 and square). Needs a #161616 or light ground; the body vanishes on pure black. No "DEVSA TV" wordmark beside it. |
| `stickers/` | the house sticker style: `stickers.html` (Ship it., LGTM, WELCOME, the prompt, mascots), `election.html` and `vote.html` (Election Day, I Voted: holo foil, glitter die-cut edge, papel picado letters, pixel ballot box, ASCII decode). Each `*.cjs` renders stills and GIF frames. |
| `network/` | the community network as art (`art.html`, same geometry as `components/community-network.tsx`): Instagram 1080x1350, YouTube 1920x1080, an 18x24 poster, a 15x18 shirt at 300 dpi, and the Community Roundtable deck's 1200x630 share card (`?f=og`). |
| `shared/devsa-prompt.js` | the logo's own chevron and underline cursor, for anything that types at a prompt. Use it instead of a font's ">" and a block cursor. |
| `shared/assets/` | copies of the marks and the PySA pieces the stickers load. |
| `localhost/` | the localhost:210 square icon (the lockups and wordmarks live in `public/branding/localhost/`). |

## Rendering

The scripts drive Chrome with `puppeteer-core`, which the site doesn't depend on:

```
PUPPETEER_CORE=/path/to/node_modules/puppeteer-core node network/shot.cjs ~/Desktop/network-out
PUPPETEER_CORE=... node stickers/shot.cjs ~/Desktop/stickers-out
PUPPETEER_CORE=... node stickers/election.cjs ~/Desktop/election-out
PUPPETEER_CORE=... node stickers/vote.cjs ~/Desktop/vote-out [one-sticker]
```

`CHROME=` overrides the Chrome path (macOS default). Always pass an output folder outside
the repo; rendered PNGs and GIFs don't belong in git.

Turn frames into a transparent looping GIF:
`ffmpeg -framerate 12 -i frames/<k>/%02d.png -filter_complex "[0:v]split[a][b];[a]palettegen=reserve_transparent=1[p];[b][p]paletteuse=alpha_threshold=128" -loop 0 out.gif`

## Things to know

- The City of San Antonio icons (Alamo, Tower of the Americas, Torch of Friendship...) are City
  artwork and are kept out of this public repo, on the local machine at `~/Downloads/cosa-icons/SVG`.
  `stickers/vote.cjs` reads them from there.

- `network/groups.js` is a snapshot of the groups from October 2026. The live list is
  `/api/communities`; update the snapshot (and add any new logo to
  `public/slides/community-roundtable-nov12/assets/logos/`) before printing a new poster.
- The stickers load Geist from Google Fonts, so render with a network connection.
- Brand rules still apply: the two shipped marks only, never inverted or recoloured,
  no "DEVSA" wordmark beside the mark (the papel picado cut-mark is the one exception),
  the PySanAntonio mascot never pixelated. See the `design-system` skill.
