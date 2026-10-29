import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifiedEmail } from '@/lib/admin-auth';
import { logActivity } from '@/lib/activity-log';
import { getDb, COLLECTIONS, type ApprovedAdmin, type PastLead } from '@/lib/firebase-admin';
import { isProtectedAdmin } from '@/lib/protected-admins';
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from '@/lib/resend';
import { AccessApprovedEmail } from '@/lib/emails/access-approved';
import { cleanEmail, cleanText, monthYear } from '@/lib/organizer-directory';

/**
 * Hand a group on: an organizer invites the next lead, and may step down.
 *
 * Built for student orgs, whose leads graduate every May, but open to any
 * organizer. The successor gets organizer access to the caller's own group and
 * nothing else; it never moves someone who already organizes another group, and
 * never touches an admin's account. Admins add people from Manage Admins instead.
 *
 * Stepping down removes the caller's access and adds their name and title to the
 * group's past leads (no email), so the group's history outlives the handoff.
 */
export async function POST(request: NextRequest) {
  try {
    const email = await verifiedEmail(request);
    if (!email) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const successor = cleanEmail(body.email);
    const stepDown = body.stepDown === true;
    if (!successor || successor === 'invalid') {
      return NextResponse.json({ error: "Enter the next lead's email" }, { status: 400 });
    }

    const db = getDb();
    const me = email.toLowerCase();
    const callerQuery = await db.collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', me).limit(1).get();
    if (callerQuery.empty) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 });
    }
    const caller = callerQuery.docs[0].data() as ApprovedAdmin;
    if (caller.role !== 'organizer' || !caller.communityId) {
      return NextResponse.json(
        { error: 'Handoff is for a group’s organizers. Admins can add people from Manage Admins.' },
        { status: 403 }
      );
    }
    if (successor === me) {
      return NextResponse.json({ error: "That's your own email" }, { status: 400 });
    }
    if (isProtectedAdmin(successor)) {
      return NextResponse.json({ error: 'That account can’t be changed here' }, { status: 403 });
    }

    const communityRef = db.collection(COLLECTIONS.COMMUNITIES).doc(caller.communityId);
    const communitySnap = await communityRef.get();
    if (!communitySnap.exists) {
      return NextResponse.json({ error: 'Your group no longer exists' }, { status: 404 });
    }

    // The successor: new, or already an organizer of this same group. Anyone else is left alone.
    const existing = await db.collection(COLLECTIONS.APPROVED_ADMINS).where('email', '==', successor).limit(1).get();
    let created = false;
    if (!existing.empty) {
      const other = existing.docs[0].data() as ApprovedAdmin;
      if (other.role !== 'organizer' || (other.communityId && other.communityId !== caller.communityId)) {
        return NextResponse.json(
          { error: 'That person already has access for another group. Ask a DEVSA admin to move them.' },
          { status: 409 }
        );
      }
      if (!other.communityId) await existing.docs[0].ref.update({ communityId: caller.communityId });
    } else {
      const record: ApprovedAdmin = {
        email: successor,
        approvedAt: new Date(),
        approvedBy: me,
        role: 'organizer',
        communityId: caller.communityId,
      };
      await db.collection(COLLECTIONS.APPROVED_ADMINS).add(record);
      created = true;
    }
    await logActivity({ actor: me, action: 'approved', kind: 'admin', targetId: successor, label: successor, detail: `organizer · ${caller.communityId}, added by a fellow organizer` });

    // Stepping down: on the group's record first, then the access goes.
    if (stepDown) {
      const lead: PastLead = {
        name: [caller.firstName, caller.lastName].filter(Boolean).join(' ').trim() || cleanText(body.name, 80) || me.split('@')[0],
        title: caller.title ?? null,
        until: monthYear(),
      };
      await communityRef.update({ pastLeads: FieldValue.arrayUnion(lead), updatedAt: new Date() });
      await callerQuery.docs[0].ref.delete();
      await logActivity({ actor: me, action: 'removed', kind: 'admin', targetId: callerQuery.docs[0].id, label: me, detail: `stepped down from ${caller.communityId}` });
    }

    // The welcome email is a courtesy; the access is already granted if it fails.
    if (created && isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: successor,
          replyTo: EMAIL_REPLY_TO,
          subject: 'Your DEVSA organizer access is approved',
          html: AccessApprovedEmail({ email: successor, communityOrg: communitySnap.data()?.name }),
        });
      } catch (emailError) {
        console.error('Failed to send handoff email:', emailError);
      }
    }

    return NextResponse.json({ success: true, created, steppedDown: stepDown });
  } catch (error) {
    console.error('Handoff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
