import Link from "next/link"
import { headers } from "next/headers"
import { ArrowRight, CalendarDays, Users, Home } from "lucide-react"

/**
 * The app's 404, in DEVSA's terminal register.
 *
 * Two jobs. The first is structural: `notFound()` renders the nearest
 * `not-found.tsx`, and there was no boundary anywhere in the tree, so Next fell
 * back to an unbranded built-in — a bare "404" on white, on a site that is
 * otherwise near-black and typeset in Geist.
 *
 * The second is tone. The brand's voice is welcoming, technical and
 * action-oriented, so a dead end is the wrong shape for it: this frames the
 * miss as a shell command that didn't resolve, then spends most of its space on
 * the three places worth going instead. Nobody arrives here on purpose, so the
 * page's real job is to be a junction rather than an apology.
 *
 * Built from the design system rather than invented: near-black `#0a0a0a`
 * ground, the traffic-light dots in teal/rose/orange that the navbar and the
 * logo both use, rose `#ef426f` for the one primary action, Geist Mono for
 * anything machine-ish and Geist Sans for the headline.
 *
 * It names the path that failed, which is what makes it read as a system
 * responding rather than a generic page being served — and it does that on the
 * server. The obvious way, `usePathname`, forces `"use client"` on the whole
 * file, and the 404 then server-renders as "Loading..." and only paints after
 * hydration. So `proxy.ts` forwards the requested path as `x-pathname` and
 * this reads it back. Echoing the path is worth keeping; a 404 that needs
 * JavaScript to say anything is not.
 */
export default async function NotFound() {
  const pathname = (await headers()).get("x-pathname")

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center bg-[#0a0a0a]">
      <div className="page-shell py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          {/* Terminal window. The dots are the brand's, in the brand's order —
              the same three that open the navbar's mobile menu and sit across
              the top of the logo. */}
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="flex items-center gap-2.5 border-b border-neutral-800 px-5 py-3.5">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00b2a9]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef426f]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff8200]" />
              </div>
              <span className="font-mono text-[11px] leading-none text-neutral-500">
                ~/devsa
              </span>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {/* The failed command, echoed back. `break-all` because a long
                  mistyped path must not push the panel wider than the page. */}
              <p className="font-mono text-[13px] leading-relaxed text-neutral-400">
                <span className="text-[#ef426f]">$</span> cd{" "}
                <span className="break-all text-white">{pathname || "/"}</span>
              </p>
              <p className="mt-1.5 font-mono text-[13px] leading-relaxed text-neutral-500">
                cd: no such file or directory
              </p>

              <h1 className="mt-7 font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white sm:text-5xl">
                404
                <span className="mt-2 block text-2xl sm:text-3xl">
                  This page isn&apos;t{" "}
                  <span className="font-light italic text-neutral-500">here</span>.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-base leading-[1.6] text-neutral-400">
                It may have moved, or the group, partner or event it belonged to
                may no longer be listed. Everything current lives in the calendar
                and the directory — both a click away.
              </p>

              {/* The point of the page. Three real destinations, ordered the way
                  the site ranks them: the calendar first, because it is what
                  DEVSA leads with everywhere else. */}
              <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/events"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef426f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:w-auto"
                >
                  <CalendarDays className="h-4 w-4" />
                  Community Calendar
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/buildingtogether"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-neutral-600 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:w-auto"
                >
                  <Users className="h-4 w-4" />
                  Building Together
                </Link>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-neutral-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:w-auto"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </nav>

              {/* Prompt returned. The cursor is `animate-pulse` rather than a
                  bespoke keyframe so it respects reduced-motion settings the
                  same way the rest of the site's pulses do. */}
              <div className="mt-8 flex items-center gap-2 border-t border-neutral-800 pt-5 font-mono text-[13px] text-neutral-500">
                <span className="text-[#ef426f]">$</span>
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-1.5 animate-pulse bg-[#ef426f]"
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">
            DEVSA · Find your people. Build your future.
          </p>
        </div>
      </div>
    </main>
  )
}
