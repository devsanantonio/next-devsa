import { AccessRequestForm } from "@/components/access-request-form"
import Link from "next/link"
import { ArrowLeft, Building2, CalendarPlus, Mic2, Users } from "lucide-react"

/**
 * What an approved organizer actually gets. Every line here maps to something
 * real in the portal — see the organizer branch in app/api/admin/data/route.ts
 * and the community-scoped event and RSVP queries — so the page never promises
 * a capability the dashboard does not have.
 */
const CAPABILITIES = [
  {
    icon: CalendarPlus,
    title: "Post your events",
    body: "Publish to the DEVSA community calendar — the shared feed the whole city reads, embeds and subscribes to.",
  },
  {
    icon: Building2,
    title: "Run your community page",
    body: "Keep your logo, description and every link current on Building Together, without emailing anyone to do it.",
  },
  {
    icon: Users,
    title: "See who's coming",
    body: "RSVPs for your own events as they come in, exportable to CSV for check-in.",
  },
  {
    icon: Mic2,
    title: "Collect talk submissions",
    body: "When your group hosts a conference, speaker submissions land in your dashboard instead of a spreadsheet.",
  },
]

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center bg-white">
      {/* Splits at lg: below 1024px the two columns would be ~290px each, too
          narrow for both the copy and the form, so it stacks instead. */}
      <div className="page-shell grid items-center gap-12 py-24 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Left: the invitation */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to the calendar
            </Link>

            {/* Deliberately not framed as promoting your own group: /signin is
                the "For Organizers" lane of the same three-audience story the
                homepage tells (see components/audience-lanes.tsx), so the
                headline names the shared platform, not the individual group. */}
            <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-balance text-gray-900 md:text-5xl">
              One platform for everyone{" "}
              <span className="font-light italic text-[#ef426f]">
                building San Antonio.
              </span>
            </h1>

            <p className="max-w-xl text-lg font-light leading-[1.4] text-gray-700 md:text-xl">
              Builders, organizers and partners all work off{" "}
              <strong className="font-semibold text-gray-900">
                one calendar, one directory, one audience
              </strong>
              . Organizer access is how your group takes part in what&apos;s
              happening now — 20+ San Antonio tech communities, run by the people
              doing the work.
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                  <Icon className="h-4 w-4 text-[#ef426f]" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                  <p className="mt-0.5 max-w-md text-sm leading-relaxed text-gray-500">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="max-w-xl border-t border-gray-200 pt-6 text-sm leading-relaxed text-gray-500">
            Every request is reviewed by a DEVSA admin, so access is tied to a
            real group and a real person. Already listed on{" "}
            <Link
              href="/buildingtogether"
              className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-900"
            >
              Building Together
            </Link>
            ? Pick your group from the list and we&apos;ll connect the account to it.
          </p>
        </div>

        {/* Right: the request form */}
        <div className="lg:sticky lg:top-28">
          <AccessRequestForm />
        </div>
      </div>
    </main>
  )
}
