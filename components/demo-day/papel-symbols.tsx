/**
 * DEVSA's own papel picado symbols — drawn for these sheets, not borrowed.
 *
 * Chosen over Lucide (outline UI icons that read as printed on the paper, not
 * cut from it) and Phosphor Fill (solid, but generic) after a side-by-side on
 * identical sheets. The rules that make them a set:
 *
 * - One 48-unit grid and one weight, so twelve symbols read as a family.
 * - Solid cuts with paper left inside them — the rocket's window, the chip's
 *   inner square, the keyhole, the gear's hub, the shield's inner line, the
 *   arm's joints — the way the DEVSA mark leaves its prompt and "SA" as paper.
 * - The lace border's four-point star reused as a motif: the spark is three
 *   of them, and the shield carries one.
 * - The terminal follows the DEVSA mark's chunky chevron and rounded
 *   underscore.
 *
 * Everything is drawn for a mask: black is cut away, white puts paper back.
 * Healthcare is a helix, never a red cross (a protected emblem); defense is a
 * generic shield, never real insignia, rank or a seal.
 */

const STAR_D =
  "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"

function Star({ cx, cy, size, fill = "black" }: { cx: number; cy: number; size: number; fill?: string }) {
  return (
    <path
      transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})`}
      d={STAR_D}
      fill={fill}
    />
  )
}

const line = {
  stroke: "black",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const PIN_STOPS = [17, 24, 31]

/* The helix, precomputed: two strands half a turn apart, rungs only where the
   strands are far enough apart to leave paper between them. */
const DNA_A = "24.00,5 26.05,6 28.02,7 29.81,8 31.36,9 32.59,10 33.46,11 33.92,12 33.97,13 33.58,14 32.79,15 31.63,16 30.14,17 28.39,18 26.45,19 24.41,20 22.35,21 20.36,22 18.53,23 16.93,24 15.63,25 14.68,26 14.14,27 14.01,28 14.31,29 15.02,30 16.11,31 17.54,32 19.24,33 21.15,34 23.17,35 25.24,36 27.25,37 29.12,38 30.77,39 32.14,40 33.16,41 33.79,42 34.00,43"
const DNA_B = "24.00,5 21.95,6 19.98,7 18.19,8 16.64,9 15.41,10 14.54,11 14.08,12 14.03,13 14.42,14 15.21,15 16.37,16 17.86,17 19.61,18 21.55,19 23.59,20 25.65,21 27.64,22 29.47,23 31.07,24 32.37,25 33.32,26 33.86,27 33.99,28 33.69,29 32.98,30 31.89,31 30.46,32 28.76,33 26.85,34 24.83,35 22.76,36 20.75,37 18.88,38 17.23,39 15.86,40 14.84,41 14.21,42 14.00,43"
const DNA_RUNGS = "M18.61 10 H29.39 M17.62 14 H30.38 M17.88 26 H30.12 M18.22 30 H29.78 M22.08 38 H25.92 M17.41 42 H30.59"

/** The builders' strip: terminal, braces, chip, spark, rocket, network. */
export const BUILDER_SYMBOLS: (() => React.JSX.Element)[] = [
  () => (
    <>
      <path d="M9 13 L21 24 L9 35" {...line} strokeWidth={6.5} />
      <rect x="24" y="31" width="16" height="6.5" rx="3.25" fill="black" />
    </>
  ),
  () => (
    <>
      <path d="M18 6 C12 6 11 9 11 13 V19 C11 22 9 24 6 24 C9 24 11 26 11 29 V35 C11 39 12 42 18 42" {...line} strokeWidth={5} />
      <path d="M30 6 C36 6 37 9 37 13 V19 C37 22 39 24 42 24 C39 24 37 26 37 29 V35 C37 39 36 42 30 42" {...line} strokeWidth={5} />
      <path d="M24 18.5 L29.5 24 L24 29.5 L18.5 24 Z" fill="black" />
    </>
  ),
  () => (
    <>
      <rect x="12" y="12" width="24" height="24" rx="4" fill="black" />
      <rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="white" strokeWidth={2.6} />
      {PIN_STOPS.map((p) => (
        <g key={p} fill="black">
          <rect x={p - 1.9} y="5" width="3.8" height="6" rx="1.2" />
          <rect x={p - 1.9} y="37" width="3.8" height="6" rx="1.2" />
          <rect x="5" y={p - 1.9} width="6" height="3.8" rx="1.2" />
          <rect x="37" y={p - 1.9} width="6" height="3.8" rx="1.2" />
        </g>
      ))}
    </>
  ),
  () => (
    <>
      <Star cx={19} cy={27} size={31} />
      <Star cx={37} cy={11} size={15} />
      <Star cx={40} cy={29} size={10} />
    </>
  ),
  () => (
    <g transform="rotate(40 24 24) translate(24 24) scale(1.24) translate(-24 -24)">
      <path d="M24 3 C31.5 9.5 33.5 19 31.5 31 H16.5 C14.5 19 16.5 9.5 24 3 Z" fill="black" />
      <circle cx="24" cy="16.5" r="4.2" fill="white" />
      <path d="M16.8 22 L9.5 32.5 H16.5 Z M31.2 22 L38.5 32.5 H31.5 Z" fill="black" />
      <path d="M19.5 35 L24 45.5 L28.5 35 Z" fill="black" />
    </g>
  ),
  () => (
    <>
      <path d="M24 24 L9 9 M24 24 L39 10 M24 24 L10 39 M24 24 L38 38" stroke="black" strokeWidth={4} strokeLinecap="round" />
      <circle cx="24" cy="24" r="7.5" fill="black" />
      <circle cx="24" cy="24" r="3" fill="white" />
      <circle cx="9" cy="9" r="5.2" fill="black" />
      <circle cx="39" cy="10" r="5.2" fill="black" />
      <circle cx="10" cy="39" r="5.2" fill="black" />
      <circle cx="38" cy="38" r="5.2" fill="black" />
    </>
  ),
]

/** The industries' strip, in DEMO_DAY_INDUSTRIES order. */
export const INDUSTRY_SYMBOLS: (() => React.JSX.Element)[] = [
  // Aerospace
  () => (
    <g transform="rotate(45 24 24)">
      <rect x="20.8" y="3" width="6.4" height="42" rx="3.2" fill="black" />
      <path d="M24 17 L45 28.5 V33 L24 26 L3 33 V28.5 Z" fill="black" />
      <path d="M24 37.5 L34 42.5 V45.5 L24 42.5 L14 45.5 V42.5 Z" fill="black" />
      <rect x="22.6" y="7.5" width="2.8" height="6" rx="1.4" fill="white" />
    </g>
  ),
  // Cybersecurity
  () => (
    <>
      <path d="M15 21 V15.5 a9 9 0 0 1 18 0 V21" {...line} strokeWidth={5.2} />
      <rect x="8.5" y="20" width="31" height="24" rx="5" fill="black" />
      <circle cx="24" cy="29.5" r="3.8" fill="white" />
      <rect x="22.4" y="30.5" width="3.2" height="7.5" rx="1.6" fill="white" />
    </>
  ),
  // Healthcare & Bioscience
  () => (
    <>
      <polyline points={DNA_A} {...line} strokeWidth={5} />
      <polyline points={DNA_B} {...line} strokeWidth={5} />
      <path d={DNA_RUNGS} stroke="black" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // Manufacturing
  () => (
    <>
      {Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x="20.5" y="2.5" width="7" height="10" rx="1.6" fill="black" transform={`rotate(${k * 45} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="15" fill="black" />
      <circle cx="24" cy="24" r="6.5" fill="white" />
    </>
  ),
  // Military & Defense
  () => (
    <>
      <path d="M24 3.5 L40.5 9.5 V22 C40.5 33.5 33.5 40.5 24 44.5 C14.5 40.5 7.5 33.5 7.5 22 V9.5 Z" fill="black" />
      <path d="M24 9.5 L35 13.6 V22.2 C35 30.2 30.4 35.3 24 38.4 C17.6 35.3 13 30.2 13 22.2 V13.6 Z" fill="none" stroke="white" strokeWidth={2.6} />
      <Star cx={24} cy={23.5} size={11} fill="white" />
    </>
  ),
  // Robotics
  () => (
    <>
      <path d="M7 44.5 H31 L27.5 38 H10.5 Z" fill="black" />
      <path d="M19 38 L17 25.5 L33 15.5" {...line} strokeWidth={6} />
      <circle cx="17" cy="25.5" r="5.6" fill="black" />
      <circle cx="17" cy="25.5" r="2.2" fill="white" />
      <circle cx="33.5" cy="15" r="4.6" fill="black" />
      <circle cx="33.5" cy="15" r="1.7" fill="white" />
      <path d="M36 11.5 L40.5 6 L45 8 M37.5 18 L43.5 20 L45.5 16" {...line} strokeWidth={3.6} />
    </>
  ),
]
