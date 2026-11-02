import { NextRequest, NextResponse } from 'next/server';
import { verifiedEmail } from '@/lib/admin-auth';
import { hostedEventIdsFor } from '@/lib/hosted-events';
import { checkBotId } from 'botid/server';
import { getDb, COLLECTIONS, type SpeakerSubmission } from '@/lib/firebase-admin';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { SpeakerThankYouEmail, getSpeakerThankYouSubject } from '@/lib/emails/speaker-thank-you';
import { PysaThankYouEmail, getPysaThankYouSubject } from '@/lib/emails/pysa-thank-you';
import {
  AccessGrantedThankYouEmail,
  getAccessGrantedThankYouSubject,
} from '@/lib/emails/access-granted-thank-you';
import {
  AccessGrantedInternalEmail,
  getAccessGrantedInternalSubject,
} from '@/lib/emails/access-granted-internal';
import { AG_EVENT_ID, AG_FIRST_TIME_SPEAKER, AG_NOTIFY_EMAILS } from '@/data/access-granted/2026';
import { SpeakerAcceptedEmail, SpeakerDeclinedEmail, getSpeakerDecisionSubject, speakerEventName } from '@/lib/emails/speaker-decision';
import { GroupTalkNotifyEmail, getGroupTalkNotifySubject, TalkSharedEmail } from '@/lib/emails/speaker-group';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { groupCallEventId, plainText, OPEN_POOL_ID, isPoolTalk, SPEAKER_CALL_LIMITS as L } from '@/lib/speaker-calls';
import { logActivity } from '@/lib/activity-log';
import { FieldValue } from 'firebase-admin/firestore';
import type { Community } from '@/lib/firebase-admin';
import { emailLogoUrl } from '@/lib/email-logo';
import { isAdminRole } from '@/lib/admin-roles';
import { PROTECTED_ADMIN_EMAILS } from '@/lib/protected-admins';

const DEFAULT_EVENT_ID = 'aiconference2026';

interface SpeakerSubmissionRequest {
  name: string;
  email: string;
  company?: string;
  sessionTitle: string;
  sessionFormat?: string;
  track?: string;
  abstract: string;
  bio?: string;
  linkedin?: string;
  audienceLevel?: string;
  considerFor?: string;
  accommodations?: string;
  eventId?: string;
  /** Set by a group's call for speakers, in place of eventId. */
  communityId?: string;
  /** The answer to the group's own question, if it asked one. */
  answer?: string;
  /** The open pool on /speak, and the speaker's consent to have the talk shared with groups. */
  pool?: boolean;
  shareConsent?: boolean;
  /**
   * Set by the Access Granted form when one person picked "Both". It is not
   * persisted — the volunteer signup is its own record — it only tells the
   * confirmation and the organizer notification to say so.
   */
  alsoVolunteering?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body: SpeakerSubmissionRequest = await request.json();
    // A community group's standing call (lib/speaker-calls.ts) has its own path:
    // it checks the call is open, and tells the group's organizers.
    if (body.communityId !== undefined) return submitToGroup(request, body);
    // The open pool on /speak: no group chosen; an admin shares it later.
    if (body.pool === true) return submitToPool(request, body);
    const {
      name, email, company, sessionTitle, sessionFormat, track, abstract, bio, linkedin,
      audienceLevel, considerFor, accommodations, eventId, alsoVolunteering,
    } = body;

    // Validate required fields
    if (!name || !email || !sessionTitle || !abstract) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Submit to Firestore (use null instead of undefined for Firestore compatibility)
    const db = getDb();
    const submission: SpeakerSubmission = {
      name,
      email: email.toLowerCase(),
      company: company || null,
      sessionTitle,
      sessionFormat: sessionFormat || null,
      track: track || null,
      abstract,
      bio: bio || null,
      linkedin: linkedin || null,
      audienceLevel: audienceLevel || null,
      considerFor: considerFor || null,
      accommodations: accommodations || null,
      eventId: eventId || DEFAULT_EVENT_ID,
      submittedAt: new Date(),
      status: 'pending',
    };

    const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);

    // Send thank you email if Resend is configured. Each event gets its own
    // template — a new eventId without a case here falls back to the AI
    // Conference email, which would be the wrong event entirely.
    const resolvedEventId = eventId || DEFAULT_EVENT_ID;
    const { subject, html } = (() => {
      switch (resolvedEventId) {
        case 'pysanantonio-2026':
          return {
            subject: getPysaThankYouSubject(sessionTitle),
            html: PysaThankYouEmail({
              name,
              sessionTitle,
              sessionFormat: sessionFormat || '',
              audienceLevel: audienceLevel || '',
              considerFor: considerFor || '',
            }),
          };
        case AG_EVENT_ID:
          return {
            subject: getAccessGrantedThankYouSubject(sessionTitle),
            html: AccessGrantedThankYouEmail({
              name,
              sessionTitle,
              sessionFormat: sessionFormat || '',
              audienceLevel: audienceLevel || '',
              // The Access Granted form reuses `considerFor` to carry the
              // first-time-speaker answer rather than adding a column to
              // SpeakerSubmission for one event — see the form's own note.
              firstTimeSpeaker: considerFor === AG_FIRST_TIME_SPEAKER,
              alsoVolunteering: alsoVolunteering === true,
            }),
          };
        default:
          return {
            subject: getSpeakerThankYouSubject(sessionTitle),
            html: SpeakerThankYouEmail({
              name,
              sessionTitle,
              sessionFormat: sessionFormat || track || '',
            }),
          };
      }
    })();

    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email.toLowerCase(),
          replyTo: EMAIL_REPLY_TO,
          subject,
          html,
        });
        console.log('Thank you email sent to:', email);
      } catch (emailError) {
        // Log but don't fail the submission if email fails
        console.error('Failed to send thank you email:', emailError);
      }
    } else {
      console.log('Resend not configured - skipping thank you email');
    }

    // Organizer notification. Access Granted only for now — other events have
    // no recipient list — and swallowed like the confirmation above, because a
    // mail failure must never cost someone their submission.
    if (resolvedEventId === AG_EVENT_ID && isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [...AG_NOTIFY_EMAILS],
          replyTo: email.toLowerCase(),
          subject: getAccessGrantedInternalSubject({ kind: 'talk', name, sessionTitle }),
          html: AccessGrantedInternalEmail({
            kind: 'talk',
            name,
            email: email.toLowerCase(),
            sessionTitle,
            sessionFormat,
            audienceLevel,
            abstract,
            bio,
            company,
            linkedin,
            notes: accommodations,
            firstTimeSpeaker: considerFor === AG_FIRST_TIME_SPEAKER,
            alsoVolunteering: alsoVolunteering === true,
          }),
        });
        console.log('Organizer notification sent for %s submission:', 'talk', AG_NOTIFY_EMAILS.join(', '));
      } catch (notifyError) {
        console.error('Failed to send organizer notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully',
      recordId: docRef.id,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The talk fields every group and pool submission shares, capped and plain, or the 400 to return. The link is required. */
function talkFields(body: SpeakerSubmissionRequest) {
  const name = plainText(body.name, L.name);
  const email = plainText(body.email, L.email)?.toLowerCase() ?? null;
  const sessionTitle = plainText(body.sessionTitle, L.sessionTitle);
  const abstract = plainText(body.abstract, L.abstract);
  if (!name || !email || !sessionTitle || !abstract) {
    return NextResponse.json({ error: 'Name, email, a talk title and a description are required.' }, { status: 400 });
  }
  if (!EMAIL_SHAPE.test(email)) {
    return NextResponse.json({ error: 'That email address doesn\'t look right.' }, { status: 400 });
  }
  // A link is required, so organizers can see who they'd be booking: LinkedIn, GitHub or a site.
  const linkedin = plainText(body.linkedin, L.link);
  if (!linkedin || !/^https?:\/\/\S+\.\S+/i.test(linkedin)) {
    return NextResponse.json({ error: 'Add a link to your LinkedIn, GitHub or personal site.' }, { status: 400 });
  }
  return {
    name,
    email,
    company: null,
    sessionTitle,
    sessionFormat: plainText(body.sessionFormat, 60),
    track: null,
    abstract,
    // No bio field on the form any more; kept for older talks, and for a client that still sends one.
    bio: plainText(body.bio, L.bio),
    linkedin,
    audienceLevel: plainText(body.audienceLevel, 40),
    considerFor: null,
    accommodations: null,
  };
}

/**
 * The open pool: a talk from someone who doesn't know which group it fits. Only
 * stored with the speaker's consent to share it; only admins see it until one
 * shares it with a group (shareTalk). The super admins hear about each one.
 */
async function submitToPool(request: NextRequest, body: SpeakerSubmissionRequest) {
  const limit = rateLimit(`speakers:${getClientIp(request)}`, 5, 60_000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);
  if (body.shareConsent !== true) {
    return NextResponse.json({ error: 'Tick the box so we can share your talk with the groups it fits.' }, { status: 400 });
  }
  const talk = talkFields(body);
  if (talk instanceof NextResponse) return talk;

  const db = getDb();
  const submission: SpeakerSubmission = {
    ...talk,
    eventId: OPEN_POOL_ID,
    shareConsent: true,
    sharedWith: [],
    submittedAt: new Date(),
    status: 'pending',
  };
  const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);

  if (isResendConfigured() && resend) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: talk.email,
        replyTo: EMAIL_REPLY_TO,
        subject: getSpeakerThankYouSubject(talk.sessionTitle),
        html: SpeakerThankYouEmail({ name: talk.name, sessionTitle: talk.sessionTitle, sessionFormat: talk.sessionFormat || '', pool: true }),
      });
    } catch (emailError) {
      console.error('Failed to send pool talk thank-you:', emailError);
    }
    try {
      // To the site's owner (lib/protected-admins.ts), who routes pool talks. This
      // went to the `superadmin` role until that role was retired (lib/admin-roles.ts).
      const to = [...PROTECTED_ADMIN_EMAILS];
      if (to.length) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to,
          replyTo: talk.email,
          subject: getGroupTalkNotifySubject('Open pool', talk.sessionTitle),
          html: GroupTalkNotifyEmail({
            groupName: 'Open pool', name: talk.name, email: talk.email, sessionTitle: talk.sessionTitle,
            sessionFormat: talk.sessionFormat, audienceLevel: talk.audienceLevel, abstract: talk.abstract,
            bio: talk.bio, link: talk.linkedin,
          }),
        });
      }
    } catch (notifyError) {
      console.error('Failed to notify admins of a pool talk:', notifyError);
    }
  }

  return NextResponse.json({ success: true, recordId: docRef.id });
}

/**
 * An admin shares an open-pool talk with a group. The group gets its own copy
 * (eventId `group:<id>`, routedFrom the pool talk), so each group it is shared
 * with decides on it independently, in its own Speakers tab; the pool talk keeps
 * a list of where it went. The group's organizers and the speaker are told.
 */
async function shareTalk(adminEmail: string, adminData: FirebaseFirestore.DocumentData, submissionId: string, communityId: string) {
  if (!isAdminRole(adminData.role)) {
    return NextResponse.json({ error: 'Only admins can share talks from the open pool' }, { status: 403 });
  }
  const db = getDb();
  const poolRef = db.collection(COLLECTIONS.SPEAKERS).doc(submissionId);
  const [poolDoc, groupDoc] = await Promise.all([poolRef.get(), db.collection(COLLECTIONS.COMMUNITIES).doc(communityId).get()]);
  const talk = poolDoc.data() as SpeakerSubmission | undefined;
  if (!talk || !isPoolTalk(talk.eventId)) {
    return NextResponse.json({ error: 'That talk is not in the open pool' }, { status: 400 });
  }
  if (talk.shareConsent !== true) {
    return NextResponse.json({ error: 'The speaker did not agree to have this talk shared' }, { status: 400 });
  }
  if (!groupDoc.exists) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if ((talk.sharedWith || []).some((s) => s.communityId === communityId)) {
    return NextResponse.json({ error: 'Already shared with that group' }, { status: 409 });
  }
  const groupName = String(groupDoc.data()?.name || communityId);
  const groupLogo = emailLogoUrl({ id: communityId, logo: groupDoc.data()?.logo });
  const at = new Date();
  const copy: SpeakerSubmission = {
    name: talk.name, email: talk.email, company: talk.company ?? null,
    sessionTitle: talk.sessionTitle, sessionFormat: talk.sessionFormat ?? null, track: null,
    abstract: talk.abstract, bio: talk.bio ?? null, linkedin: talk.linkedin ?? null,
    audienceLevel: talk.audienceLevel ?? null, considerFor: null, accommodations: null,
    eventId: groupCallEventId(communityId), communityId, groupName,
    routedFrom: poolRef.id, suggestedBy: adminEmail,
    submittedAt: at, status: 'pending',
  };
  const copyRef = await db.collection(COLLECTIONS.SPEAKERS).add(copy);
  await poolRef.update({ sharedWith: FieldValue.arrayUnion({ communityId, groupName, by: adminEmail, at }) });
  await logActivity({
    actor: adminEmail,
    action: 'sent',
    kind: 'speaker',
    targetId: copyRef.id,
    label: `"${talk.sessionTitle}" shared with ${groupName}`,
  });

  if (isResendConfigured() && resend) {
    try {
      const [assigned, alsoRun] = await Promise.all([
        db.collection(COLLECTIONS.APPROVED_ADMINS).where('communityId', '==', communityId).get(),
        db.collection(COLLECTIONS.APPROVED_ADMINS).where('organizerOf', 'array-contains', communityId).get(),
      ]);
      const to = [...new Set([...assigned.docs, ...alsoRun.docs].map((d) => String(d.data().email || '').toLowerCase()).filter(Boolean))];
      if (to.length) {
        await resend.emails.send({
          from: EMAIL_FROM, to, replyTo: talk.email,
          subject: getGroupTalkNotifySubject(groupName, talk.sessionTitle, true),
          html: GroupTalkNotifyEmail({
            groupName, name: talk.name, email: talk.email, sessionTitle: talk.sessionTitle,
            sessionFormat: talk.sessionFormat, audienceLevel: talk.audienceLevel, abstract: talk.abstract,
            bio: talk.bio, link: talk.linkedin, suggested: true, groupLogo,
          }),
        });
      }
    } catch (notifyError) {
      console.error('Failed to notify group organizers of a shared talk:', notifyError);
    }
    try {
      await resend.emails.send({
        from: EMAIL_FROM, to: talk.email, replyTo: EMAIL_REPLY_TO,
        subject: `Your talk is with ${groupName}`,
        html: TalkSharedEmail({ name: talk.name, sessionTitle: talk.sessionTitle, groupName, groupId: communityId, groupLogo }),
      });
    } catch (emailError) {
      console.error('Failed to tell the speaker their talk was shared:', emailError);
    }
  }

  return NextResponse.json({ success: true, sharedWith: { communityId, groupName, by: adminEmail, at: at.toISOString() }, copyId: copyRef.id });
}

/**
 * A talk offered to a community group through its call for speakers. Refused
 * unless the group's call is open right now, so a stale page can't submit to a
 * closed call. Rate limited on top of BotID because each one emails the group's
 * organizers. Text is stored plain and capped (plainText), never HTML-encoded.
 */
async function submitToGroup(request: NextRequest, body: SpeakerSubmissionRequest) {
  const limit = rateLimit(`speakers:${getClientIp(request)}`, 5, 60_000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  const communityId = typeof body.communityId === 'string' ? body.communityId.trim() : '';
  const db = getDb();
  const groupDoc = communityId ? await db.collection(COLLECTIONS.COMMUNITIES).doc(communityId).get() : null;
  const group = groupDoc?.exists ? (groupDoc.data() as Community) : null;
  if (!group || group.speakersOpen !== true) {
    return NextResponse.json({ error: "This group isn't taking talks right now." }, { status: 400 });
  }

  const talk = talkFields(body);
  if (talk instanceof NextResponse) return talk;
  const { name, email, sessionTitle, abstract } = talk;
  const question = group.speakersQuestion || null;
  const submission: SpeakerSubmission = {
    ...talk,
    eventId: groupCallEventId(communityId),
    communityId,
    groupName: group.name,
    question,
    answer: question ? plainText(body.answer, L.answer) : null,
    submittedAt: new Date(),
    status: 'pending',
  };
  const docRef = await db.collection(COLLECTIONS.SPEAKERS).add(submission);
  const groupLogo = emailLogoUrl({ id: communityId, logo: group.logo });

  if (isResendConfigured() && resend) {
    // Thank the speaker. Swallowed on failure: the talk is already saved.
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        replyTo: EMAIL_REPLY_TO,
        subject: getSpeakerThankYouSubject(sessionTitle),
        html: SpeakerThankYouEmail({ name, sessionTitle, sessionFormat: submission.sessionFormat || '', groupName: group.name, groupLogo }),
      });
    } catch (emailError) {
      console.error('Failed to send group talk thank-you:', emailError);
    }

    // Tell the group's organizers: those assigned to it, and admins who run it too (organizerOf).
    try {
      const [assigned, alsoRun] = await Promise.all([
        db.collection(COLLECTIONS.APPROVED_ADMINS).where('communityId', '==', communityId).get(),
        db.collection(COLLECTIONS.APPROVED_ADMINS).where('organizerOf', 'array-contains', communityId).get(),
      ]);
      const to = [...new Set([...assigned.docs, ...alsoRun.docs].map((d) => String(d.data().email || '').toLowerCase()).filter(Boolean))];
      if (to.length) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to,
          replyTo: email,
          subject: getGroupTalkNotifySubject(group.name, sessionTitle),
          html: GroupTalkNotifyEmail({
            groupName: group.name, name, email, sessionTitle,
            sessionFormat: submission.sessionFormat, audienceLevel: submission.audienceLevel,
            abstract, bio: submission.bio, link: submission.linkedin,
            question, answer: submission.answer, groupLogo,
          }),
        });
      }
    } catch (notifyError) {
      console.error('Failed to notify group organizers:', notifyError);
    }
  }

  return NextResponse.json({ success: true, recordId: docRef.id });
}

// Delete a speaker submission
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId } = body;
    const adminEmail = await verifiedEmail(request);

    if (!submissionId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is an admin
    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const adminData = adminQuery.docs[0].data();
    if (!isAdminRole(adminData.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can delete speaker submissions' },
        { status: 403 }
      );
    }

    // Check if submission exists
    const submissionDoc = await db.collection(COLLECTIONS.SPEAKERS).doc(submissionId).get();
    if (!submissionDoc.exists) {
      return NextResponse.json(
        { error: 'Speaker submission not found' },
        { status: 404 }
      );
    }

    // Delete the submission
    await db.collection(COLLECTIONS.SPEAKERS).doc(submissionId).delete();

    return NextResponse.json({
      success: true,
      message: 'Speaker submission deleted successfully',
    });

  } catch (error) {
    console.error('Delete speaker submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

const REVIEW_STATUSES: SpeakerSubmission['status'][] = ['pending', 'approved', 'rejected'];

/**
 * Set a submission's review status. Admins can review any event; an organizer
 * only the events their community hosts — the same scope /api/admin/data uses
 * to decide what they can read, from the same helper.
 *
 * Changing a status sends nothing to the speaker unless the reviewer ticks
 * "Email the speaker" (`notify: true`), and then only for Accept or Decline.
 * A notified decision records `notifiedAt`, so the panel can say it was sent.
 */
export async function PATCH(request: NextRequest) {
  try {
    const adminEmail = await verifiedEmail(request);
    if (!adminEmail) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { submissionId, status, notify, shareWith } = await request.json();
    if (submissionId && typeof shareWith === 'string' && shareWith) {
      const who = await getDb().collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', adminEmail.toLowerCase()).limit(1).get();
      if (who.empty) return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
      return shareTalk(adminEmail.toLowerCase(), who.docs[0].data(), submissionId, shareWith);
    }
    if (!submissionId || !REVIEW_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const db = getDb();
    const adminQuery = await db
      .collection(COLLECTIONS.APPROVED_ADMINS)
      .where('email', '==', adminEmail.toLowerCase())
      .limit(1)
      .get();
    if (adminQuery.empty) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }

    const ref = db.collection(COLLECTIONS.SPEAKERS).doc(submissionId);
    const submissionDoc = await ref.get();
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Speaker submission not found' }, { status: 404 });
    }

    const adminData = adminQuery.docs[0].data();
    const isAdmin = isAdminRole(adminData.role);
    if (!isAdmin) {
      const eventIds = await hostedEventIdsFor(adminData.communityId);
      if (!eventIds.includes(submissionDoc.data()?.eventId)) {
        return NextResponse.json({ error: 'Unauthorized - not your event' }, { status: 403 });
      }
    }

    await ref.update({
      status,
      reviewedBy: adminEmail.toLowerCase(),
      reviewedAt: new Date(),
    });

    // The decision email, only when asked for. A failure is reported, not thrown:
    // the status is already saved.
    let notified = false;
    if (notify === true && (status === 'approved' || status === 'rejected') && isResendConfigured() && resend) {
      const sub = submissionDoc.data() as SpeakerSubmission;
      // A group call's talk is "at" the group, by the name it had when the talk came in.
      const eventName = sub.groupName || speakerEventName(sub.eventId);
      const accepted = status === 'approved';
      // A group's talk gets the meetup wording and the group's logo, not a conference's.
      let group: { name: string; logo: string | null } | null = null;
      if (sub.communityId && sub.groupName) {
        const groupDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(sub.communityId).get();
        group = { name: sub.groupName, logo: emailLogoUrl({ id: sub.communityId, logo: groupDoc.data()?.logo }) };
      }
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: sub.email.toLowerCase(),
          replyTo: EMAIL_REPLY_TO,
          subject: getSpeakerDecisionSubject(accepted, eventName),
          html: (accepted ? SpeakerAcceptedEmail : SpeakerDeclinedEmail)({ name: sub.name, sessionTitle: sub.sessionTitle, eventName, group }),
        });
        await ref.update({ notifiedAt: new Date() });
        notified = true;
      } catch (emailError) {
        console.error('Failed to send speaker decision email:', emailError);
      }
    }

    return NextResponse.json({ success: true, notified });
  } catch (error) {
    console.error('Update speaker status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
