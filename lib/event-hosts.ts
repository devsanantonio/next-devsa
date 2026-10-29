/**
 * Who hosts an event. A collaboration stores its hosts comma-separated —
 * `communityId: "alamo-python,pytexas"`, and co-hosting partners likewise in
 * `partnerId` — so "is this my group's event?" is membership, never equality.
 *
 * Equality is what the events API used for organizers until 2026-10: a
 * co-hosted event matched neither host, so it was missing from both groups'
 * Events tabs and the server refused either organizer's edits. Anything that
 * asks whether a group hosts an event should come through here.
 */
export function eventHosts(event: { communityId?: unknown; partnerId?: unknown }): string[] {
  return [event.communityId, event.partnerId]
    .flatMap((v) => String(v ?? '').split(','))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isHostedBy(event: { communityId?: unknown; partnerId?: unknown }, groupId: string | null | undefined): boolean {
  return !!groupId && eventHosts(event).includes(groupId);
}
