import Link from "next/link"
import Image from "next/image"

/**
 * PyTexas 2026 announcement artwork, closing the 2025 archive.
 *
 * The "Learn More" button is gone — the poster already says everything the
 * button did, and it was the last rounded-full CTA on the page. The whole
 * artwork carries the link instead, so the section keeps its destination
 * without a control sitting on top of the illustration.
 */
export default function PyTexasCTA() {
  return (
    <section
      className="relative h-75 w-full overflow-hidden md:h-202.5"
      data-bg-type="dark"
    >
      <Link
        href="https://www.pytexas.org/2026/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="PyTexas 2026 — visit pytexas.org"
        className="group block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffdd00]"
      >
        <Image
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pytexas2026_day_color.svg"
          alt="PyTexas 2026"
          fill
          sizes="100vw"
          className="object-contain transition-transform duration-500 group-hover:scale-[1.02] md:object-cover"
        />
      </Link>
    </section>
  )
}
