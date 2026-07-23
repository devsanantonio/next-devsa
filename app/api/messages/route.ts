import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type Conversation, type Message, type Notification } from '@/lib/firebase-admin';
import { verifyJobBoardUser, isSuperAdmin } from '@/lib/auth-middleware';
import { resend, EMAIL_FROM, isResendConfigured } from '@/lib/resend';
import { NewMessageEmail } from '@/lib/emails/new-message';

// GET - List conversations or get messages for a conversation
export async function GET(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const db = getDb();
    const conversationId = request.nextUrl.searchParams.get('conversationId');

    if (conversationId) {
      // Get messages for a specific conversation
      const convoDoc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).get();

      if (!convoDoc.exists) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const convoData = convoDoc.data() as Conversation;

      // Only participants and superadmin can view
      if (!convoData.participants.includes(result.uid) && !isSuperAdmin(result.email)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const messagesSnapshot = await db.collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', conversationId)
        .get();

      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        readAt: doc.data().readAt?.toDate?.()?.toISOString() || doc.data().readAt,
      }));

      // Sort in-memory to avoid requiring a composite index
      messages.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

      // Mark unread messages as read
      const unreadMessages = messagesSnapshot.docs.filter(
        doc => doc.data().senderUid !== result.uid && !doc.data().readAt
      );
      const batch = db.batch();
      unreadMessages.forEach(doc => {
        batch.update(doc.ref, { readAt: new Date() });
      });
      if (unreadMessages.length > 0) {
        await batch.commit();
      }

      return NextResponse.json({
        conversation: {
          ...convoData,
          id: convoDoc.id,
          createdAt: (convoData.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString?.() || convoData.createdAt,
          lastMessageAt: (convoData.lastMessageAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString?.() || convoData.lastMessageAt,
        },
        messages,
      });
    }

    // Unread message count only
    const countOnly = request.nextUrl.searchParams.get('countOnly');
    if (countOnly === 'true') {
      const convosSnap = await db.collection(COLLECTIONS.CONVERSATIONS)
        .where('participants', 'array-contains', result.uid)
        .get();
      let unreadCount = 0;
      for (const convoDoc of convosSnap.docs) {
        const msgsSnap = await db.collection(COLLECTIONS.MESSAGES)
          .where('conversationId', '==', convoDoc.id)
          .get();
        unreadCount += msgsSnap.docs.filter(
          doc => doc.data().senderUid !== result.uid && !doc.data().readAt
        ).length;
      }
      return NextResponse.json({ unreadCount });
    }

    // List all conversations for the current user
    const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
      .where('participants', 'array-contains', result.uid)
      .get();

    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      lastMessageAt: doc.data().lastMessageAt?.toDate?.()?.toISOString() || doc.data().lastMessageAt,
    }));

    // Sort in-memory to avoid requiring a composite index
    conversations.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send a message (create conversation if needed)
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { recipientUid, conversationId, content, jobId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date();
    const senderName = `${result.profile!.firstName} ${result.profile!.lastName}`;

    let convoId = conversationId;

    if (!convoId) {
      // Create a new conversation or find existing one
      if (!recipientUid) {
        return NextResponse.json(
          { error: 'Recipient UID or conversation ID is required' },
          { status: 400 }
        );
      }

      // Prevent messaging yourself
      if (recipientUid === result.uid) {
        return NextResponse.json(
          { error: 'Cannot message yourself' },
          { status: 400 }
        );
      }

      // Check if the recipient exists
      const recipientDoc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(recipientUid).get();
      if (!recipientDoc.exists) {
        return NextResponse.json(
          { error: 'Recipient not found' },
          { status: 404 }
        );
      }

      const recipientData = recipientDoc.data()!;
      const recipientName = `${recipientData.firstName} ${recipientData.lastName}`;

      // Check for existing conversation between these two users
      const existingConvo = await db.collection(COLLECTIONS.CONVERSATIONS)
        .where('participants', 'array-contains', result.uid)
        .get();

      const existingWithRecipient = existingConvo.docs.find(doc => {
        const data = doc.data() as Conversation;
        return data.participants.includes(recipientUid) && data.participants.length === 2;
      });

      if (existingWithRecipient) {
        convoId = existingWithRecipient.id;
      } else {
        // Create new conversation
        const newConvo: Omit<Conversation, 'id'> = {
          participants: [result.uid, recipientUid],
          participantNames: {
            [result.uid]: senderName,
            [recipientUid]: recipientName,
          },
          participantImages: {
            [result.uid]: result.profile!.profileImage || '',
            [recipientUid]: recipientData.profileImage || '',
          },
          lastMessage: content,
          lastMessageAt: now,
          jobId: jobId || '',
          createdAt: now,
        };

        const convoRef = await db.collection(COLLECTIONS.CONVERSATIONS).add(newConvo);
        convoId = convoRef.id;
      }
    } else {
      // Verify user is a participant in the existing conversation
      const convoDoc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(convoId).get();
      if (!convoDoc.exists) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const convoData = convoDoc.data() as Conversation;
      if (!convoData.participants.includes(result.uid)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Create the message
    const message: Omit<Message, 'id'> = {
      conversationId: convoId,
      senderUid: result.uid,
      senderName,
      senderImage: result.profile!.profileImage,
      content,
      createdAt: now,
    };

    const messageRef = await db.collection(COLLECTIONS.MESSAGES).add(message);

    // Update conversation with last message
    await db.collection(COLLECTIONS.CONVERSATIONS).doc(convoId).update({
      lastMessage: content,
      lastMessageAt: now,
    });

    // Get the conversation to find the other participant
    const convoDoc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(convoId).get();
    const convoData = convoDoc.data() as Conversation;

    // Notify the other participant(s)
    const otherParticipants = convoData.participants.filter(uid => uid !== result.uid);
    const notifications = otherParticipants.map(recipientUid => {
      const notification: Omit<Notification, 'id'> = {
        recipientUid,
        type: 'message',
        title: 'New message',
        body: `${senderName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        link: `/bounties/dashboard/messages/${convoId}`,
        sourceUid: result.uid,
        sourceName: senderName,
        referenceId: convoId,
        read: false,
        createdAt: now,
      };
      return db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);
    });

    await Promise.all(notifications);

    // Email each recipient — but only if they have no other unread messages
    // from the sender in this conversation. That throttles email spam on
    // back-and-forth chats: one email per "they're not currently engaged"
    // window. Fire-and-forget so a slow Resend call doesn't delay the API.
    if (isResendConfigured() && resend) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devsa.community';
      const jobTitle: string | undefined = convoData.jobId
        ? await (async () => {
            try {
              const jobDoc = await db.collection(COLLECTIONS.JOB_LISTINGS).doc(convoData.jobId!).get();
              return jobDoc.exists ? (jobDoc.data()?.title as string | undefined) : undefined;
            } catch {
              return undefined;
            }
          })()
        : undefined;

      for (const recipientUid of otherParticipants) {
        // Check for prior unread messages from this sender to this recipient.
        // If any exist, the recipient was already emailed; skip to avoid spam.
        const priorUnread = await db
          .collection(COLLECTIONS.MESSAGES)
          .where('conversationId', '==', convoId)
          .where('senderUid', '==', result.uid)
          .get();
        const hasPriorUnreadFromSender = priorUnread.docs.some(
          (doc) => doc.id !== messageRef.id && !doc.data().readAt
        );
        if (hasPriorUnreadFromSender) continue;

        try {
          const recipientDoc = await db.collection(COLLECTIONS.JOB_BOARD_USERS).doc(recipientUid).get();
          const recipientData = recipientDoc.data();
          const recipientEmail = recipientData?.email;
          if (!recipientEmail) continue;
          const recipientName =
            recipientData?.displayName ||
            `${recipientData?.firstName || ''} ${recipientData?.lastName || ''}`.trim() ||
            '';

          await resend.emails.send({
            from: EMAIL_FROM,
            to: recipientEmail,
            subject: `${senderName} sent you a message — DEVSA Bounties`,
            html: NewMessageEmail({
              recipientName,
              senderName,
              messagePreview: content,
              conversationUrl: `${siteUrl}/bounties/dashboard/messages?conversation=${convoId}`,
              jobTitle,
            }),
          });
        } catch (emailErr) {
          console.error('Failed to send new-message email:', emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      messageId: messageRef.id,
      conversationId: convoId,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
