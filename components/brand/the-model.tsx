import { MODEL_INK, MODEL_LAVENDER } from "@/data/the-model/2026"

/**
 * The Model's brand primitives.
 *
 * These exist because the wordmark was wrong, and it was wrong for a
 * structural reason rather than a careless one: nothing owned it. It was hand
 * written as a span on the one page that needed it, so there was no single
 * place for the brand to be right, and the version that shipped disagreed with
 * the reel playing directly beneath it on four counts at once.
 *
 * Specified in sasw-geekdom/next-sasw's ModelBand, which is the brand's home.
 * Reproduced here rather than imported because the two sites deploy
 * separately; kept in one component here so a third page cannot invent a
 * fifth variant.
 *
 * The identity is an editor's, and three things carry it:
 *
 *   · `//` opens every label, the way the artwork's own top line does.
 *   · the wordmark is a HALF-finished selection — "The" plain, "Model" caught
 *     in a block with its ink knocked out. The half-ness is the whole gesture:
 *     the artwork is a picture of a partial click-drag. Blocking the entire
 *     name does not approximate that, it erases it, which is what the first
 *     version here did.
 *   · Geist Mono throughout. The artwork is set in a plain monospace, so a
 *     display face beside it is a second voice. The first version used Geist
 *     Sans at `font-black` — a display weight, the exact thing the brand's own
 *     notes rule out.
 *
 * Note that `font-mono` only started resolving to Geist Mono in this repo once
 * `--font-mono` was mapped in globals.css. Before that it fell through to the
 * OS monospace, so even a correct port of this would have rendered wrong.
 */

/** Text caught inside a selection — a block of color, ink knocked out. */
export function ModelSelection({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      /* box-decoration-clone so a phrase wrapping to a second line gets a
         block on each, the way a real selection does, rather than one box
         stretched around the turn. */
      className={`box-decoration-clone px-1.5 ${className}`}
      style={{ backgroundColor: MODEL_LAVENDER, color: MODEL_INK }}
    >
      {children}
    </span>
  )
}

/**
 * The wordmark: THE + a selected MODEL.
 *
 * `-mr-1.5` after the block because a selection ends a hair past its last
 * glyph — without the padding the block stops flush against the "L" and reads
 * as a crop — and the negative margin keeps that padding from shifting
 * whatever follows.
 *
 * Renders a span, not a heading. The caller decides whether this is an h1, and
 * on the event page it sits inside a sentence rather than standing alone.
 */
export function ModelWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-mono font-medium uppercase tracking-tight text-white/85 ${className}`}
    >
      The <ModelSelection className="-mr-1.5">Model</ModelSelection>
    </span>
  )
}

/**
 * A section label, opened by `//`.
 *
 * The comment marker is the cheapest possible carrier of the editor idea — it
 * costs two characters and does more brand work than a colored rule would.
 */
export function ModelLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.18em] text-white/40 ${className}`}
    >
      <span style={{ color: MODEL_LAVENDER }}>{"// "}</span>
      {children}
    </p>
  )
}
