import Link from "next/link"
import {
  ACCESS_GRANTED,
  ACCESS_GREEN,
  AG_LOCK,
  AG_ONE_LINER,
  AG_ORGANIZERS,
} from "@/data/access-granted/2026"
import { disabledSlot, primaryButton } from "@/components/access-granted/2026/button-styles"
import { OrganizerLogo } from "@/components/brand/probe-chip"
import { hasHappened } from "@/lib/event-phase"

/**
 * Access Granted's masthead.
 *
 * Carries four things and nothing else: the name, the hook, who powers it, and
 * one action. Everything factual — the week lockup, the date, the time, the
 * room — moved down to sit with the schedule, where a reader looking up when
 * something started is already headed. A masthead that opens with logistics
 * spends its best position on the least interesting thing on the page.
 *
 * ## The ground is pure black
 *
 * #000000, not the site's #0a0a0a. The lock loop's own ground is pure black,
 * and at 0a the video sat in a visible rectangle — a four-point step is
 * invisible on most surfaces and obvious where a video meets a page. Matching
 * it exactly is what makes the render look like it is happening on the page
 * rather than inside a box on it.
 *
 * ## The art column
 *
 * Three layers, so the render sits *in* something rather than on it. A video
 * with a hard silhouette cannot be dissolved into the black — masking would
 * cut the object. What it can have is an environment, and the artwork supplies
 * the logic: it is already emitting green light, so the honest move is to let
 * that light land on something.
 *
 *   · a schematic grid, faint and radially masked, giving the glow a surface
 *     to fall on — HUD rather than poster.
 *   · the lock's own spill, centered on the body rather than parked beside it.
 *   · a contact shadow under the body, the one cue that says an object has
 *     weight and is resting on something.
 *
 * Both wash layers reach left, past the art and under the copy, rather than
 * being a halo around the object.
 *
 * Sized to fill its column now rather than capped at 22rem. The cap existed so
 * a tall portrait render would not tower over the copy beside it; the loop is
 * near-square, so the same width reads shorter and the two columns balance at
 * full width on a laptop and on an external display alike.
 */
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
      <span aria-hidden="true" style={{ color: ACCESS_GREEN }}>
        {">_ "}
      </span>
      {children}
    </p>
  )
}

export function AccessGrantedHero() {
  const isPast = hasHappened(ACCESS_GRANTED.end)

  return (
    <section className="relative overflow-x-clip bg-black" data-bg-type="dark">
      <div className="page-shell pt-2 pb-14 md:pt-3 md:pb-20 lg:pb-24">
        {/* items-start, not items-center. Centered, the shorter copy column was
              being pushed down the height of the video beside it — 145px of
              empty space under the back link, against 53px on a page with no
              video. The columns now share a top edge and the gap is the
              section's padding, which is the only thing that should set it. */}
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14 xl:gap-20">
          {/* Copy */}
          <div className="order-2 lg:order-0">
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span style={{ color: ACCESS_GREEN }}>Access</span> Granted
            </h1>

            {/* A rule rather than a filled green panel — a solid block of
                #00ff66 at this size shouts, and the green stays sparing. */}
            <p
              className="mt-6 border-l-2 pl-5 text-pretty text-lg text-white/80 md:text-xl"
              style={{ borderColor: ACCESS_GREEN }}
            >
              {AG_ONE_LINER.setup} {AG_ONE_LINER.turn}
            </p>

            <div className="mt-10">
              <Prompt>Powered by</Prompt>
              {/* Three across on phones. As a flex-wrap this ran 4 + 1 from
                  414px up — every Pro-sized handset — widowing the last mark.
                  A fixed three keeps the rows even; sm and up it flows. */}
              {/* Three across at every width, so six marks always read as two
                  even rows. The flex-wrap this replaced ran 5 + 1 once the copy
                  column narrowed for the larger art, widowing DEVSA on its own
                  line — the same failure the phone layout was already fixed
                  for, reappearing at desktop. */}
              <ul className="mt-5 grid w-fit grid-cols-[repeat(3,auto)] items-center justify-items-start gap-x-8 gap-y-7 sm:gap-x-10 sm:gap-y-8">
                {AG_ORGANIZERS.map((org) => (
                  <li key={org.name}>
                    <OrganizerLogo org={org} accent={ACCESS_GREEN} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              {isPast ? (
                <Link href="#lineup" className={primaryButton}>
                  See the 2026 lineup
                </Link>
              ) : (
                <span className={disabledSlot}>Speaker lineup coming soon</span>
              )}
            </div>
          </div>

          {/* The lock, on nothing.

              Three layers used to sit behind it — a schematic grid, a green
              wash and a contact shadow. They were there because the art was a
              transparent PNG with a hard silhouette: an object like that has
              to be given an environment or it reads as pasted on.

              The loop brings its own. It is a rendered scene with its own
              circuit backdrop and its own emitted light, so every one of those
              layers was a second grid over a grid and a second glow over a
              glow — two green fields at slightly different angles, which is
              what was clashing.

              The contact shadow went with them, which is the one call here
              that was not asked for: the lock in the loop is already lit and
              grounded in its own scene, and with the video masked to fade at
              its edges a green ellipse underneath sits in the faded zone and
              reads as a smear rather than as weight. */}
          {/* A fixed 44px lift, and fixed is the point.

              Cropping the dead space out of the asset got the lock's opaque
              top to the frame's top, but its first *visible* pixel is still
              lower: the radial mask fades the frame's edges, and the lock sits
              inside that fade. What is left is a constant — measured at 43px
              at 1440, 1920 and 2560 alike — so a constant corrects it.

              A percentage was tried while the asset still had dead space in it
              and could not work: it scales with the column while the heading's
              position does not, landing within a pixel at 1440 and overshooting
              by 43px at 1920. Fixing the asset is what made a fixed offset
              correct. */}
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-0 lg:-mt-11 lg:max-w-none">
            {/* Muted and autoplaying, so it is decoration by every definition
                the platforms use: no sound, no controls, nothing announced.
                `poster` is the loop's own lit frame, so the first paint is the
                artwork rather than a gap. */}
            <video
              src={AG_LOCK.src}
              poster={AG_LOCK.poster}
              width={AG_LOCK.width}
              height={AG_LOCK.height}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
              /* It reaches above the section's padding once pulled up, and the
                 top of the frame is empty and masked to nothing. Nothing to
                 click on it anyway — no controls — so it must not sit over the
                 back link and swallow the pointer. */
              className="pointer-events-none relative h-auto w-full"
              /* The loop's extreme edges are pure black, but its interior
                 carries a circuit-board backdrop that is not — so without a
                 mask the texture simply stops, and the eye reads the stopping
                 line as a box around the video.

                 Opaque through the middle 58%, where the lock sits, then out
                 to nothing. The lock keeps its full density and the backdrop
                 dissolves into the page instead of ending. */
              style={{
                maskImage:
                  "radial-gradient(ellipse 72% 72% at 50% 50%, black 58%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 72% at 50% 50%, black 58%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
