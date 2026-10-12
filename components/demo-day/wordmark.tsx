import { Big_Shoulders_Inline, Big_Shoulders_Stencil } from "next/font/google"
import { DEMO_DAY_NAME } from "@/lib/demo-day"

/**
 * Confluencia's wordmark: the name set in Big Shoulders Stencil.
 *
 * A typeface, not a second papel picado sheet. At eleven letters the name is
 * too long to cut legibly into one sheet — the stencil gets small and thin,
 * and image models misspell long words — while live text stays crisp at every
 * size, is read by screen readers and search, and can change year to year.
 *
 * Big Shoulders Stencil because it is the same hand as the sheet: a heavy,
 * condensed stencil whose bridges look like the cut lettering on the papel
 * picado, so the wordmark and the artwork read as one identity. The sheet's
 * own "DEMO DAY" becomes the descriptor — "Confluencia · a DEVSA Demo Day".
 *
 * Loaded through next/font, never by family name: next/font registers hashed
 * names, so a literal "Big Shoulders Stencil" would only match for readers
 * who had it installed (see the design-system skill). Like Access Granted's
 * Oswald, it is this event's display face and nowhere else on the site.
 */
const inline = Big_Shoulders_Inline({
  subsets: ["latin"],
  weight: ["900"],
  display: "swap",
})

const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: ["800", "900"],
  display: "swap",
})

export function ConfluenciaWordmark({
  as: Tag = "span",
  className,
}: {
  as?: "span" | "h1" | "h2"
  className?: string
}) {
  return (
    <Tag className={`${stencil.className} font-black uppercase leading-[0.85] tracking-[0.01em] ${className ?? ""}`}>
      {DEMO_DAY_NAME}
    </Tag>
  )
}

/**
 * The wordmark inside running text — a button, a heading, a sentence. Sized in
 * em so it scales with whatever surrounds it; 1.18em because the stencil is
 * condensed and its capitals sit lower than a sentence's mixed case, so at
 * 1em it reads small. Every mention of the name on the event page uses this,
 * so the name always looks like the name.
 */
export function ConfluenciaName({ className }: { className?: string }) {
  return (
    <ConfluenciaWordmark
      className={`inline-block align-[-0.06em] text-[1.18em] leading-none ${className ?? ""}`}
    />
  )
}

/**
 * The display cut, for the masthead only: Big Shoulders Inline, the same
 * skeleton as the stencil with carved inline strokes that read as strung
 * lights at hero size — the Flambeau night without saying so.
 *
 * Only ever large. At button or sentence size the inline strokes blur, which
 * is why every smaller mention uses the stencil (ConfluenciaName). Two cuts of
 * one family: display for the big moment, stencil for everyday use.
 */
export function ConfluenciaDisplay({ className }: { className?: string }) {
  return (
    <span className={`${inline.className} font-black uppercase leading-[0.82] tracking-[0.005em] ${className ?? ""}`}>
      {DEMO_DAY_NAME}
    </span>
  )
}
