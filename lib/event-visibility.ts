/**
 * Link-only events: Luma's "private", and the only kind of private this site has.
 *
 * An event with `unlisted: true` keeps its page, its RSVP and its share images
 * at /events/<slug>, so anyone with the link can see it and sign up. What it
 * loses is every list: the calendar and its embed, the RSS/JSON feeds, the
 * subscribable .ics, the Monday Discord digest, the sitemap, the group and
 * partner pages, and the homepage. Its page also tells search engines not to
 * index it. It is not access control — there is no password and no approval —
 * so it is for an invite, not a secret.
 *
 * Every surface that lists events asks this one function. A list that forgets
 * to ask leaks the event, which is the failure this repo has had before with a
 * "fallback" that was really a second source of truth; keeping the rule in one
 * place is what stops a twelfth surface getting it subtly different.
 *
 * Absent on every event that predates it, which reads as listed.
 */
export function isListed(event: { unlisted?: unknown }): boolean {
  return event.unlisted !== true
}
