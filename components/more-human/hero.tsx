import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MoreHumanWordmark } from "@/components/brand/more-human"
import { getConference } from "@/data/conferences"

const MH_AMBER = "#ff9900"

/**
 * More Human Than Human's masthead.
 *
 * The same shape the other three conference mastheads carry: the name, what it
 * is, and the art. Nothing factual — the date, the time, the room — because
 * those moved down to sit with the running order, where a reader looking up
 * when something started is already headed. A masthead that opens with
 * logistics spends its best position on the least interesting thing on the
 * page.
 *
 * Written in the present. An earlier version of this file had it in the past
 * tense behind an "Archive" label, on the understanding that the February 2026
 * edition was the last one and The Model had taken the slot. That is not what
 * is happening: both run, as two AI conferences pointed at different
 * industries, verticals and workflows. There is no date for the next edition
 * yet, so this says nothing about one — but it does not retire a conference
 * that is coming back.
 *
 * ## The art is the head, and it autoplays here
 *
 * On the portfolio card the same clip waits behind the lettering until somebody
 * hovers, because four tiles decoding four videos nobody has pointed at is a
 * cost with nothing on the other side. Here it is the subject — the page is
 * about this conference and nothing else — so it runs, exactly as Access
 * Granted's padlock and PySanAntonio's mascot do on their own mastheads.
 *
 * Muted and autoplaying, so it is decoration by every definition the platforms
 * use: no sound, no controls, nothing announced. The poster is a lit frame, so
 * the first paint is the artwork rather than a gap.
 *
 * ## The ground is pure black
 *
 * #000000, not the site's #0a0a0a, and the page it sits on matches. The clip's
 * own ground is pure black, so at 0a it rendered as a faintly *darker*
 * rectangle — measured at (3,1,3) inside against (10,10,10) outside. A
 * four-point step is invisible on most surfaces and obvious where a video meets
 * a page, and no mask fixes it: a mask fades the edges, and this was the
 * interior. The Access Granted masthead reached the same conclusion about its
 * padlock and its page is `bg-black` for the same reason.
 */
/**
 * The rotating head, in one place so the desktop bleed and the phone's in-flow
 * copy can never drift. Both pull the same file, so neither placement is the
 * expensive one.
 *
 * Muted and autoplaying, so it is decoration by every definition the platforms
 * use: no sound, no controls, nothing announced. The poster is a lit frame, so
 * the first paint is the artwork rather than a gap.
 */
function MoreHumanClip({
  conference,
  className,
}: {
  conference: NonNullable<ReturnType<typeof getConference>>
  className?: string
}) {
  return (
    <video
      src={conference.hoverVideo}
      poster={conference.hoverPoster}
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ""}`}
      /* The vertical radius is the short one, and that is the whole point of
         this mask rather than a decorative softening.

         The source clips the head. Every frame in the file is cut flat across
         the crown at the top of the 1280x720 frame — the asset is framed that
         tight, and no amount of box-fitting recovers pixels that were never
         rendered. The first mask here left the top edge about 82% opaque, so
         what showed was a razor line across the skull, which reads as a
         mistake.

         A vertical radius of 48% is under half the box, so the fade has run out
         *before* the top edge and the crown is masked to nothing rather than to
         the 14% that 55% left — and 14% of a bright line on black still reads
         as a line. Losing the top of the head to a fade is a treatment; losing
         it to a straight cut is a bug.

         The horizontal radius stays wide because the sides are black anyway and
         there is nothing there to hide. */
      style={{
        maskImage:
          "radial-gradient(ellipse 85% 48% at 50% 50%, black 35%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 85% 48% at 50% 50%, black 35%, transparent 100%)",
      }}
    />
  )
}

export function MoreHumanHero() {
  const conference = getConference("more-human-than-human")
  if (!conference) return null

  return (
    <section
      className="relative flex flex-col overflow-x-clip bg-black sm:min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-5.5rem)]"
      data-bg-type="dark"
    >
      {/* The clip, bled off the right rather than boxed in a grid column.

          The section has a floor of one viewport less the back link's strip, so
          the next section does not show above the fold — on a 1440x900 laptop
          "The afternoon" was visible inside the masthead. The copy is only
          about 390px of that, which leaves a lot of hero to fill, and a 16:9
          clip inside a shell column could not fill it: at 612px wide it stood
          344px tall and read as a small head marooned in black.

          Two things were tried before this. `object-cover` into a stretched
          column scales a 16:9 source until its sides crop, which took the head
          past the ears and turned a floating portrait into a face pressed
          against the glass. Centering it at natural size in that column fixed
          the crop and kept it small. Letting it off the shell is what actually
          gives it room — the same move PySanAntonio's mascot makes on its own
          masthead, for the same reason.

          Both columns are centred on the section's own middle — the clip by
          `top-1/2`, the copy by `justify-center` — so they share an axis and
          the slack a full-viewport hero leaves over is split above and below
          rather than all pooling underneath. Top-aligning the copy and hanging
          the clip off the CTA was tried first and left a third of a screen of
          nothing under both columns.

          Desktop only. On a phone the clip sits in the copy flow instead, below
          the pitch, where there is no room for it beside anything. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 hidden aspect-video w-[62%] -translate-y-1/2 select-none lg:block xl:w-[58%]"
      >
        <MoreHumanClip conference={conference} className="h-full w-full" />
      </div>

      <div
        /* Symmetric from lg, where the content is centred: the old
           pt-3/pb-24 pair pushed the copy 37px off the axis the clip
           centers on, so the two read as almost-aligned rather than
           aligned. Below lg the copy is a stack under the back link and
           wants the top tight and the bottom open, so the asymmetry
           stays. */
        className="page-shell relative z-10 flex flex-1 flex-col pt-2 pb-14 md:pt-3 md:pb-20 lg:pt-16 lg:pb-16">
        <div className="flex flex-1 flex-col justify-center gap-12">
          <div className="order-2 lg:order-0 lg:max-w-xl xl:max-w-2xl">
            <MoreHumanWordmark size="hero" as="h1" />

            <p
              className="mt-6 border-l-2 pl-5 text-pretty text-lg text-white/80 md:text-xl"
              style={{ borderColor: MH_AMBER }}
            >
              DEVSA&apos;s AI conference, on what changes when the tools stop
              being tools — a room of builders, dreamers and technologists on
              how AI is re-architecting the way we write code, secure the
              internet and lead organizations.
            </p>

            {/* The same single action Access Granted and PySanAntonio end on.
                There is no date for the next edition and nothing to register
                for, so the one useful thing a masthead can offer is the last
                running order — which is immediately below it. */}
            <div className="mt-10">
              <Link
                href="#lineup"
                className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-black transition-opacity duration-200 hover:opacity-90"
                style={{ backgroundColor: MH_AMBER }}
              >
                See the 2026 lineup
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* The phone's copy of the clip, in the flow between the pitch and
              the lineup button rather than beside anything. */}
          <MoreHumanClip
            conference={conference}
            className="order-1 mx-auto w-full max-w-xl lg:hidden"
          />

        </div>
      </div>
    </section>
  )
}
