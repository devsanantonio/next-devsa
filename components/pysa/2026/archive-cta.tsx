import Image from "next/image"
import Link from "next/link"
import { primaryButton } from "@/components/pysa/2026/button-styles"
import { PYSA_WORDMARK } from "@/data/pysa/2026"

/**
 * Art-directed per breakpoint, because the two layouts show the photo very
 * differently and a single frame cannot serve both.
 *
 * Phones show the whole band unobstructed, so the brief is simply "the fullest
 * room": shot from inside the crowd, and the brightest right-hand zone in the
 * 2025 set (luma 96 in this crop).
 */
const PHOTO_MOBILE = {
  src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa4.jpg",
  alt: "A full room of attendees during a talk at PySanAntonio 2025",
}

/**
 * Desktop hides the left half of the frame under the copy scrim, so what
 * matters is what survives on the right. This one puts a mic'd speaker and a
 * brightly lit slide screen in exactly that zone — the screen is the brightest
 * object in the frame, so it reads as a spotlight through the gradient rather
 * than as background texture.
 *
 * Both are lazy by default and below the fold, so the hidden one is not fetched.
 */
const PHOTO_DESKTOP = {
  src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa6.jpg",
  alt: "A speaker presenting a slide to the room at PySanAntonio 2025",
}

/**
 * Scrim over the photo. Solid under the copy, then clears well before the right
 * edge so the room is actually legible — the photo is the proof, so burying it
 * under a flat 80% wash defeated the point.
 */
const SCRIM =
  "linear-gradient(to right, #0a0a0a 0%, rgba(10,10,10,0.92) 36%, rgba(10,10,10,0.45) 62%, rgba(10,10,10,0.04) 88%)"

/**
 * The wordmark's baseline sits at ~79.5% of its box; the rest is the "py"
 * descender. Cropping the span to that fraction puts its bottom edge on the
 * baseline, so `items-baseline` lands "2025" on the same line as "sanantonio"
 * instead of on the bottom of the descender. The glyph itself overflows the
 * span and is not clipped.
 */
const WORDMARK_TO_BASELINE = `${PYSA_WORDMARK.width} / ${Math.round(
  PYSA_WORDMARK.height * 0.795
)}`

/**
 * Archive card for PySanAntonio 2025 — the proof that makes someone submit a
 * talk. A single action, straight to the 2025 event page, which is where the
 * livestream and all eight sessions already live.
 */
export function ArchiveCta2025() {
  return (
    <section
      id="archive-2025"
      data-bg-type="dark"
      className="relative overflow-hidden bg-[#0a0a0a] pb-20"
    >
      <div className="page-shell relative">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 md:flex md:min-h-96">
          {/* A band of its own on phones, a full-bleed layer from md up.
              Overlaying the copy on the photo at phone widths needs so much
              scrim that the room stops reading — which was the whole problem.
              Stacked, the photo is unobstructed and the copy sits on the plain
              dark surface below it. */}
          <div className="relative h-48 w-full sm:h-56 md:absolute md:inset-0 md:h-auto">
            <Image
              src={PHOTO_MOBILE.src}
              alt={PHOTO_MOBILE.alt}
              fill
              sizes="100vw"
              className="object-cover object-center md:hidden"
            />
            <Image
              src={PHOTO_DESKTOP.src}
              alt={PHOTO_DESKTOP.alt}
              fill
              sizes="80vw"
              className="hidden object-cover object-center md:block"
            />
            <div
              aria-hidden
              className="absolute inset-0 hidden md:block"
              style={{ backgroundImage: SCRIM }}
            />
          </div>

          <div className="relative flex flex-col justify-center gap-7 p-8 md:max-w-2xl md:p-14">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                The first one
              </p>
              <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
                <span
                  className="relative block w-56 md:w-76"
                  style={{ aspectRatio: WORDMARK_TO_BASELINE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PYSA_WORDMARK.svgDark}
                    alt="PySanAntonio"
                    width={PYSA_WORDMARK.width}
                    height={PYSA_WORDMARK.height}
                    className="absolute inset-x-0 top-0 h-auto w-full"
                  />
                </span>
                <span>2025</span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-white/60">
                The first Python conference in San Antonio brought together
                developers, data scientists, and curious builders across every
                experience level. The whole day was streamed, and every session
                is still available to watch.
              </p>
            </div>

            <Link
              href="/events/pysanantonio/2025"
              className={`${primaryButton} sm:self-start`}
            >
              Relive the first one
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
