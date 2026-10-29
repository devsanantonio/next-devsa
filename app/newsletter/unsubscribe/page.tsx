import type { Metadata } from "next"
import Link from "next/link"
import { verifyUnsubscribe } from "@/lib/newsletter"

/**
 * Where a newsletter's Unsubscribe link lands. It asks for one click rather
 * than acting on arrival: mail security scanners open every link in a message,
 * and a page that unsubscribed on load would quietly unsubscribe people who
 * never asked to. The button posts to /api/newsletter/unsubscribe, which
 * redirects back here with the outcome.
 */
export const metadata: Metadata = {
  title: "Unsubscribe | DEVSA",
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string; invalid?: string; failed?: string }>
}) {
  const q = await searchParams
  const email = verifyUnsubscribe(q.e, q.t)

  let title: string
  let body: React.ReactNode
  if (q.done) {
    title = "You're unsubscribed"
    body = "You won't get the DEVSA newsletter any more. Event emails you asked for, like RSVP confirmations, still arrive."
  } else if (q.failed) {
    title = "That didn't go through"
    body = "Something went wrong on our side. Try the link again, or reply to any DEVSA email and we'll take you off the list."
  } else if (q.invalid || !email) {
    title = "This link doesn't work"
    body = "It may have been cut short when it was copied. Use the Unsubscribe link at the bottom of the newsletter, or reply to it and we'll take you off the list."
  } else {
    title = "Unsubscribe from the DEVSA newsletter?"
    body = (
      <>
        <span className="text-white">{email}</span> will stop getting it. RSVP confirmations and reminders for events you sign up to still arrive.
      </>
    )
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center bg-[#0a0a0a]">
      <div className="page-shell py-20 sm:py-28">
        <div className="mx-auto max-w-xl">
          <h1 className="text-balance font-sans text-3xl font-black tracking-[-0.02em] text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">{body}</p>
          {email && !q.done && !q.invalid && !q.failed ? (
            <form method="post" action="/api/newsletter/unsubscribe" className="mt-8">
              <input type="hidden" name="e" value={q.e} />
              <input type="hidden" name="t" value={q.t} />
              <input type="hidden" name="from" value="page" />
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
              >
                Unsubscribe
              </button>
            </form>
          ) : (
            <Link href="/events" className="mt-8 inline-flex items-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              See what&apos;s on
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
