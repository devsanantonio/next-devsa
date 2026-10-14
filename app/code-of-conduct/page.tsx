import type { Metadata } from "next"
import Link from "next/link"
import { Mail, Plus } from "lucide-react"
import { OpenOnHash } from "@/components/conduct/open-on-hash"
import {
  ADOPTED_ON,
  CONDUCT_CONTACTS,
  CONDUCT_IS_DRAFT,
  CONDUCT_REPORT_EMAIL,
} from "@/lib/conduct"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const DESCRIPTION =
  "DEVSA's code of conduct for its events, online spaces and activations: what we expect, what isn't tolerated, how to report a problem, and what happens next."

export const metadata: Metadata = {
  title: "Code of Conduct",
  description: DESCRIPTION,
  alternates: { canonical: "/code-of-conduct" },
  // Kept out of search until the board adopts it and the reporting contacts
  // exist — see lib/conduct.ts.
  robots: CONDUCT_IS_DRAFT ? { index: false, follow: false } : undefined,
  openGraph: {
    title: "DEVSA Code of Conduct",
    description: DESCRIPTION,
    url: `${siteUrl}/code-of-conduct`,
    siteName: "DEVSA",
    type: "website",
  },
}

/**
 * DEVSA's code of conduct.
 *
 * Adapted from PyTexas's (github.com/pytexas/code-of-conduct, MIT), so that
 * PySanAntonio — which DEVSA co-runs with the PyTexas Foundation — holds
 * attendees to one standard rather than two. Same shape as theirs: a short
 * version up front, then the community code (Contributor Covenant 2.1) and the
 * in-person code (PyCon / Django lineage). Three things go further than
 * theirs, deliberately: more than one way to report, what happens after a
 * report stated on the page rather than only in a linked file, and an explicit
 * scope, because DEVSA's reach is wider than one conference.
 *
 * Six clauses follow ACM San Antonio's code (acmsa.org/code-of-conduct), a group
 * on DEVSA's calendar: dismissing a concern as a joke, alcohol and getting home
 * safely, illegal substances, Meetup / livestream / Q&A in scope, online
 * moderation, and sharing a report with a co-organizer or venue.
 *
 * One page, not links to GitHub: this audience includes students, partners,
 * investors and industry partners, not only developers.
 *
 * Laid out as one aligned column beside a sticky sidebar: the title, the four
 * rules, then every section as a uniform numbered accordion row, like a
 * structured document. Reporting lives in the sticky sidebar (desktop) and a
 * slim strip under the intro (phones), always in reach without opening the
 * page with it. An earlier pass led with a dark reporting panel and read as
 * scattered; this replaced it. The collapsed text is still in the page, so search,
 * screen readers and find-in-page reach it. Every sentence is the text the
 * board adopted; only the presentation changed.
 *
 * Adopted by the board October 12, 2026. Linked from the footer (so every
 * page), the sitemap and the RSVP form on DEVSA's own events. The scope
 * clause still names Confluencia: that is the adopted text, and DEVSA co-runs
 * it as 434 MEDIA's partner. Changing the clause is the board's call.
 */
const p = "mt-4 text-base leading-[1.7] text-gray-600"
const h3 = "mt-6 text-sm font-bold uppercase tracking-[0.12em] text-gray-900"
const ul = "mt-3 list-disc space-y-2 pl-6 text-base leading-[1.6] text-gray-600"
const a = "font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"

const SECTIONS = [
  ["report", "How to report"],
  ["scope", "Where this applies"],
  ["community", "Our standards"],
  ["in-person", "At in-person events"],
  ["after-a-report", "What happens after a report"],
  ["enforcement", "Consequences"],
  ["attribution", "Where this comes from"],
] as const

const RULES = [
  { title: "Keep it professional", body: "Communicate the way you would in front of a professional audience made up of many different people." },
  { title: "No sexual content", body: "Sexual language and imagery don’t belong at any DEVSA event or in any DEVSA space, including talks and demos." },
  { title: "Be kind", body: "Don’t insult or put people down. Sexist, racist, ageist or otherwise exclusionary jokes aren’t welcome." },
  { title: "Stop when asked", body: "If someone asks you to stop, stop." },
]

const STEPS = [
  { title: "Safety first", body: "If anyone is at risk, we deal with that before anything else. We’ll involve security or police when someone’s safety is in doubt, or at the request of the person affected." },
  { title: "We listen and write it down", body: "Who was involved, what happened, when and where, and who else was there. If it’s easier, we’ll write it for you. Please don’t interview witnesses yourself." },
  { title: "Fair review", body: "We review it promptly and fairly, and the person reported gets a chance to give their side." },
  { title: "We decide and act", body: "We tell the person reported what will happen, and let you know the outcome as far as privacy allows." },
]

const LADDER = [
  { title: "Correction", body: "A private, written explanation of what was inappropriate and why. A public apology may be requested." },
  { title: "Warning", body: "A warning with consequences for continued behavior, and no contact with the people involved for a set time." },
  { title: "Removal or temporary ban", body: "Being asked to leave an event without a refund, ending a talk early or not publishing its recording, removing volunteer or speaker roles, or a ban from DEVSA spaces for a set time." },
  { title: "Permanent ban", body: "For a pattern of violations, harassment of an individual, or aggression toward a group of people." },
]

function Missing({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-sm text-amber-900">
      {children}
    </span>
  )
}

/** The reporting address, wrapping after the @ rather than ever truncating. */
function ReportEmail({ className = "" }: { className?: string }) {
  if (!CONDUCT_REPORT_EMAIL) return <Missing>reporting inbox — to be set</Missing>
  const [user, domain] = CONDUCT_REPORT_EMAIL.split("@")
  return (
    <a
      href={`mailto:${CONDUCT_REPORT_EMAIL}?subject=${encodeURIComponent("Code of conduct report")}`}
      className={`inline-flex items-start gap-2 font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 ${className}`}
    >
      <Mail className="mt-1 h-4 w-4 shrink-0" />
      <span className="break-words">
        {user}@<wbr />
        {domain}
      </span>
    </a>
  )
}

/** One numbered section row. Native <details>: no JS to read it, and find-in-page opens it. */
function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <details id={id} className="group scroll-mt-28 border-b border-gray-200">
      <summary className="flex cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
        <span className="w-8 shrink-0 text-sm font-semibold tabular-nums text-[#ef426f]">
          {String(n).padStart(2, "0")}
        </span>
        <span className="flex-1 text-xl font-black tracking-[-0.02em] text-gray-900 md:text-2xl">{title}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors group-hover:border-gray-300 group-hover:text-gray-900">
          <Plus className="h-4 w-4 transition-transform duration-200 group-open:rotate-45" />
        </span>
      </summary>
      <div className="pb-8 pl-13">{children}</div>
    </details>
  )
}

export default function CodeOfConductPage() {
  return (
    <main className="min-h-screen bg-white pt-28 md:pt-32" data-bg-type="light">
      <OpenOnHash />
      <div className="page-shell grid gap-12 pb-20 md:pb-28 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        {/* Sidebar: contents, then the reporting card. Sticky on desktop. */}
        <aside className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="On this page" className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">On this page</p>
            <ol className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li>
                <a href="#short-version" className="hover:text-gray-900">The short version</a>
              </li>
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="hover:text-gray-900">{label}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="hidden rounded-2xl border border-gray-200 bg-gray-50 p-5 lg:mt-8 lg:block">
            <p className="text-sm font-bold text-gray-900">Need to report something?</p>
            <ReportEmail className="mt-3 text-sm" />
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              In immediate danger, call <strong className="text-gray-900">911</strong> first.{" "}
              <a href="#report" className="underline underline-offset-2 hover:text-gray-900">All the ways to report</a>
            </p>
          </div>
        </aside>

        <div className="order-1 min-w-0 max-w-3xl lg:order-2">
          {CONDUCT_IS_DRAFT && (
            <div className="mb-10 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
              <strong className="font-semibold">Draft — not yet in force.</strong> This code is waiting
              on the DEVSA board&apos;s adoption and on the reporting contacts below. It isn&apos;t linked
              from the site or indexed by search engines until both are in place.
            </div>
          )}

          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-gray-500">
            Code of Conduct
          </p>
          <h1 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl">
            Everyone here should be able to{" "}
            <span className="font-light italic text-gray-400">show up</span>.
          </h1>
          <p className="mt-6 text-xl font-light leading-[1.45] text-gray-600 md:text-2xl">
            DEVSA brings San Antonio&apos;s builders, community groups and partners into the same
            rooms. That only works if everyone in them is treated with respect, so this is what we
            expect, and what we do when it doesn&apos;t happen.
          </p>

          {/* Phones: the sidebar card's job, as a slim strip. */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:hidden">
            <p className="text-sm font-bold text-gray-900">Need to report something?</p>
            <ReportEmail className="mt-2 text-sm" />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              In immediate danger, call <strong className="text-gray-900">911</strong> first.{" "}
              <a href="#report" className="underline underline-offset-2">All the ways to report</a>
            </p>
          </div>

          {/* The short version — open, the one thing everyone should read. */}
          <section id="short-version" className="mt-14 scroll-mt-28">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-gray-900 md:text-3xl">The short version</h2>
            <p className={p}>
              DEVSA is dedicated to a harassment-free experience for everyone, regardless of gender,
              gender identity and expression, sexual orientation, age, disability, physical
              appearance, body size, race, ethnicity, nationality, religion, veteran status or level
              of experience. We don&apos;t tolerate harassment of anyone, in any form.
            </p>
            <ol className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {RULES.map((r, i) => (
                <li key={r.title} className="flex gap-5 py-5">
                  <span className="w-8 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-[#ef426f]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{r.title}</p>
                    <p className="mt-1 text-base leading-relaxed text-gray-600">{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={p}>
              This applies to everyone: attendees, speakers, builders, sponsors, partners,
              volunteers, organizers and the DEVSA team.
            </p>
          </section>

          {/* Every other section: one uniform accordion. */}
          <div className="mt-14 border-t border-gray-900">
            <Section id="report" n={1} title="How to report">
              <p className={p}>
                If you&apos;re being harassed, see someone else being harassed, or have any other
                concern, tell us. You can report something that happened to you or that you saw,
                and you don&apos;t need to be sure it breaks the rules.
              </p>
              <dl className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200">
                <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-sm font-bold text-gray-900">At an event</dt>
                  <dd className="text-base text-gray-600">
                    Tell any DEVSA team member or volunteer. Venue staff can also put you in touch with us.
                  </dd>
                </div>
                <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-sm font-bold text-gray-900">Any time, in writing</dt>
                  <dd className="text-base"><ReportEmail /></dd>
                </div>
                <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-sm font-bold text-gray-900">Directly, if it&apos;s urgent or you&apos;d rather talk to a person</dt>
                  <dd className="text-base text-gray-600">
                    {CONDUCT_CONTACTS.length >= 2 ? (
                      <ul className="space-y-2">
                        {CONDUCT_CONTACTS.map((c) => (
                          <li key={c.name}>
                            <span className="font-semibold text-gray-900">{c.name}</span>, {c.role}
                            {c.phone && (
                              <>
                                {" "}
                                · <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className={a}>{c.phone}</a>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Missing>at least two named contacts — to be set</Missing>
                    )}
                  </dd>
                </div>
              </dl>
              <p className={p}>
                If anyone is in immediate danger, call <strong className="font-semibold text-gray-900">911</strong> first.
                Our team will help you contact venue security or the police, find a safe place, or
                arrange an escort.
              </p>
              <p className={p}>
                Reports are confidential. If the report involves someone on the list above, contact
                anyone else on it, and that person won&apos;t be part of handling it.
              </p>
            </Section>

            <Section id="scope" n={2} title="Where this applies">
              <ul className={ul}>
                <li>
                  Events DEVSA runs or co-runs: its conferences, Confluencia, workshops, and DEVSA
                  activations inside other events, such as a DEVSA-run track at San Antonio Startup +
                  Tech Week.
                </li>
                <li>
                  DEVSA&apos;s online spaces: the Discord, Meetup discussions, livestream chats and event
                  Q&amp;A, social channels, and the admin portal.
                </li>
                <li>
                  Anywhere someone is officially representing DEVSA, including on its behalf by email
                  or social media.
                </li>
                <li>Related social events and gatherings around DEVSA events, official or not.</li>
              </ul>
              <p className={p}>
                The community groups on the{" "}
                <Link href="/events" className={a}>calendar</Link>{" "}
                run their own events and may have their own codes. When DEVSA hosts or co-hosts, this
                one applies too.
              </p>
            </Section>

            <Section id="community" n={3} title="Our standards">
              <p className={p}>
                We pledge to make participation in the DEVSA community a harassment-free experience
                for everyone, and to act in ways that contribute to an open, welcoming, diverse,
                inclusive and healthy community.
              </p>
              <h3 className={h3}>What we expect</h3>
              <ul className={ul}>
                <li>Empathy and kindness toward other people</li>
                <li>Helping newcomers feel welcome, whether it&apos;s their first meetup or their first line of code</li>
                <li>Following the guidance of organizers, volunteers and moderators</li>
                <li>Respect for differing opinions, viewpoints and experiences</li>
                <li>Giving, and gracefully accepting, constructive feedback</li>
                <li>Taking responsibility, apologizing to those affected by our mistakes, and learning from them</li>
                <li>Focusing on what is best for the whole community, not only ourselves</li>
              </ul>
              <h3 className={h3}>What isn&apos;t acceptable</h3>
              <ul className={ul}>
                <li>Sexualized language or imagery, and sexual attention or advances of any kind</li>
                <li>Trolling, insulting or derogatory comments, and personal or political attacks</li>
                <li>Public or private harassment</li>
                <li>Dismissing a concern as a joke after someone has been made uncomfortable</li>
                <li>Publishing someone&apos;s private information, such as a home or email address, without their explicit permission</li>
                <li>Any other conduct that could reasonably be considered inappropriate in a professional setting</li>
              </ul>
            </Section>

            <Section id="in-person" n={4} title="At in-person events">
              <p className={p}>Harassment includes, but isn&apos;t limited to:</p>
              <ul className={ul}>
                <li>Offensive comments related to gender, sexual orientation, age, disability, physical appearance, body size, race, ethnicity, veteran status or religion</li>
                <li>Displaying sexually explicit or violent images</li>
                <li>Deliberate or implied intimidation</li>
                <li>Stalking or persistent following</li>
                <li>Intrusive or unwanted photography or recording</li>
                <li>Sustained disruption of talks, demos or other activities</li>
                <li>Inappropriate physical contact or unwelcome sexual attention</li>
                <li>Posting, or threatening to post, someone&apos;s personally identifying information (&ldquo;doxing&rdquo;)</li>
                <li>Advocating for or encouraging any of the above</li>
              </ul>
              <p className={p}>
                Sponsors, partners and exhibitors are covered too. Booths, demos and materials
                shouldn&apos;t use sexualized images or activities, and booth staff, including
                volunteers, shouldn&apos;t create an unprofessional environment.
              </p>
              <h3 className={h3}>Weapons, substances and safety</h3>
              <p className={p}>
                No weapons at DEVSA events. That includes guns, explosives (including fireworks) and
                large knives, and anything else carried to cause harm. Anyone with one will be asked
                to leave and may return only without it. No illegal substances, and no behavior that
                puts others at risk. Venue rules and venue staff apply too.
              </p>
              <h3 className={h3}>Where alcohol is served</h3>
              <p className={p}>
                Some DEVSA and partner events, like an evening showcase, serve alcohol. Drink
                responsibly, never pressure anyone to drink, and plan a safe way home. If you need
                help getting home safely, ask a DEVSA team member.
              </p>
            </Section>

            <Section id="after-a-report" n={5} title="What happens after a report">
              <ol className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                    <p className="text-sm font-bold text-gray-900">
                      <span className="mr-2 tabular-nums text-[#ef426f]">{i + 1}</span>
                      {step.title}
                    </p>
                    <p className="text-base leading-relaxed text-gray-600">{step.body}</p>
                  </li>
                ))}
              </ol>
              <p className={p}>
                Everything stays confidential. We won&apos;t share your identity without your
                permission, and we won&apos;t tolerate retaliation against anyone who reports in good
                faith. We never ask the person affected to withdraw a report or to decide the
                consequences; that&apos;s our job.
              </p>
              <p className={p}>
                At events DEVSA runs with a partner, such as PySanAntonio with the PyTexas Foundation,
                we may share a report with that co-organizer or with the venue so it can act under its
                own policies too. We&apos;ll tell you before we do.
              </p>
              <p className={p}>
                If an incident at an event needs to be addressed publicly, only the event lead, or
                someone they delegate, will make an announcement, and it won&apos;t include
                anyone&apos;s personal details.
              </p>
            </Section>

            <Section id="enforcement" n={6} title="Consequences">
              <p className={p}>
                Every report is handled case by case. Depending on what happened, we may take one or
                more of these steps:
              </p>
              <ol className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {LADDER.map((step, i) => (
                  <li key={step.title} className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                    <p className="text-sm font-bold text-gray-900">
                      <span className="mr-2 tabular-nums text-[#ef426f]">{i + 1}</span>
                      {step.title}
                    </p>
                    <p className="text-base leading-relaxed text-gray-600">{step.body}</p>
                  </li>
                ))}
              </ol>
              <p className={p}>
                In online spaces, moderators may also remove messages or content and limit or remove
                someone&apos;s access, right away if needed, while a report is reviewed.
              </p>
              <p className={p}>
                Anyone sanctioned can ask the DEVSA board to review the decision. The decision stands
                while it&apos;s reviewed.
              </p>
            </Section>

            <Section id="attribution" n={7} title="Where this comes from">
              <p className={p}>
                This code is adapted from the{" "}
                <a href="https://github.com/pytexas/code-of-conduct" className={a} target="_blank" rel="noopener noreferrer">
                  PyTexas Code of Conduct
                </a>{" "}
                (MIT License, © 2023 PyTexas), so PySanAntonio, which DEVSA co-runs with the PyTexas
                Foundation, holds everyone to one standard. Its community standards and consequences
                come from the{" "}
                <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct/" className={a} target="_blank" rel="noopener noreferrer">
                  Contributor Covenant 2.1
                </a>{" "}
                (CC BY 4.0) and{" "}
                <a href="https://github.com/mozilla/diversity" className={a} target="_blank" rel="noopener noreferrer">
                  Mozilla&apos;s enforcement ladder
                </a>
                . Its in-person code draws on the{" "}
                <a href="https://github.com/python/pycon-code-of-conduct" className={a} target="_blank" rel="noopener noreferrer">
                  PyCon
                </a>{" "}
                and{" "}
                <a href="https://www.djangoproject.com/conduct/" className={a} target="_blank" rel="noopener noreferrer">
                  Django
                </a>{" "}
                codes and the Ada Initiative&apos;s guide to responding to reports. A few clauses,
                including the one about dismissing concerns as jokes, follow{" "}
                <a href="https://acmsa.org/code-of-conduct" className={a} target="_blank" rel="noopener noreferrer">
                  ACM San Antonio&apos;s code
                </a>
                , so groups on our calendar share the same expectations.
              </p>
            </Section>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            {ADOPTED_ON ? (
              <>Adopted by the DEVSA board on {ADOPTED_ON}. The board maintains it.</>
            ) : (
              <>
                Adopted by the DEVSA board on <Missing>date — to be set</Missing>. The board maintains it.
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
