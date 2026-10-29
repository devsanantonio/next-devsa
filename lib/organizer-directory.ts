/**
 * The organizer directory: who runs each group, for the other organizers.
 *
 * It lives on the admin Communities tab, read-only for every signed-in admin,
 * and never on the public site. A person appears only after ticking "Show me in
 * the organizer directory" on their own profile, and only the fields below go
 * out: no sign-in metadata, no approval history.
 *
 * Shared by the profile save (PATCH /api/admin/auth), which cleans what comes
 * in, and /api/admin/data, which decides what goes out.
 */
import { sanitizeInput } from '@/lib/sanitize';
import { isProfilePhotoUrl } from '@/lib/profile-photo';

export interface DirectoryEntry {
  communityId: string | null;
  /** Every group they run: `communityId`, plus an admin's `organizerOf`. */
  groups: string[];
  role: 'superadmin' | 'admin' | 'organizer';
  name: string;
  photo: string | null;
  title: string | null;
  email: string;
  linkedin: string | null;
  gradTerm: string | null;
  confirmedAt: string | null;
}

/** Plain text, tags stripped, trimmed and capped; empty becomes null so Firestore stores a value, not undefined. */
export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = sanitizeInput(value.trim()).slice(0, max).trim();
  return text || null;
}

/** A contact email, or null. Rejects anything that isn't shaped like one rather than storing it. */
export function cleanEmail(value: unknown): string | null | 'invalid' {
  if (typeof value !== 'string' || !value.trim()) return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 ? email : 'invalid';
}

/**
 * A LinkedIn profile URL, normalized to https, or null. Only linkedin.com: the
 * directory renders it as a link other organizers click, so it must not be able
 * to point anywhere else.
 */
export function cleanLinkedin(value: unknown): string | null | 'invalid' {
  if (typeof value !== 'string' || !value.trim()) return null;
  let raw = value.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const url = new URL(raw);
    if (!/(^|\.)linkedin\.com$/i.test(url.hostname)) return 'invalid';
    url.protocol = 'https:';
    return url.toString().slice(0, 300);
  } catch {
    return 'invalid';
  }
}

/** "May 2026", in San Antonio time. */
export function monthYear(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'America/Chicago' });
}

/**
 * The groups a person runs. An organizer has one, `communityId`. An admin or
 * super admin can also run groups of their own (`organizerOf`, set on their
 * profile), and each one gets an organizer view in the account menu.
 */
export function groupsOf(data: { role?: string; communityId?: string | null; organizerOf?: unknown }): string[] {
  const extra = data.role !== 'organizer' && Array.isArray(data.organizerOf) ? data.organizerOf : [];
  return [...new Set([data.communityId, ...extra].filter((id): id is string => typeof id === 'string' && id.length > 0))];
}

/** What the directory shows of one admin record, or null if they haven't opted in. */
export function toDirectoryEntry(data: FirebaseFirestore.DocumentData): DirectoryEntry | null {
  if (data.inDirectory !== true) return null;
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  const confirmed = data.profileConfirmedAt?.toDate?.() ?? (data.profileConfirmedAt ? new Date(data.profileConfirmedAt) : null);
  return {
    communityId: data.communityId || null,
    groups: groupsOf(data),
    role: data.role,
    name: name || String(data.email).split('@')[0],
    photo: isProfilePhotoUrl(data.profileImage) ? data.profileImage : null,
    title: data.title ?? null,
    email: data.contactEmail || data.email,
    linkedin: data.linkedin ?? null,
    gradTerm: data.gradTerm ?? null,
    confirmedAt: confirmed && !Number.isNaN(confirmed.getTime()) ? confirmed.toISOString() : null,
  };
}
