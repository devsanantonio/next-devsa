import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Get notifications (unread count + recent)
export async function GET(request: NextRequest) {
  const result = await verifyJobBoardUser(request);
  if (result instanceof NextResponse) return result;

  try {
    const db = getDb();
    const countOnly = request.nextUrl.searchParams.get('countOnly') === 'true';

    // Get unread count
    const unreadSnapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
      .where('recipientUid', '==', result.uid)
      .where('read', '==', false)
      .get();

    const unreadCount = unreadSnapshot.size;

    if (countOnly) {
      return NextResponse.json({ unreadCount });
    }

    // Get recent notifications (last 50)
    const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
      .where('recipientUid', '==', result.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  const result = await verifyJobBoardUser(request);
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    const db = getDb();

    if (markAllRead) {
      // Mark all unread notifications as read
      const unreadSnapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
        .where('recipientUid', '==', result.uid)
        .where('read', '==', false)
        .get();

      const batch = db.batch();
      unreadSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Marked ${unreadSnapshot.size} notifications as read`,
      });
    }

    if (notificationIds && notificationIds.length > 0) {
      const batch = db.batch();
      for (const id of notificationIds) {
        const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(id);
        batch.update(docRef, { read: true });
      }
      await batch.commit();

      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read',
      });
    }

    return NextResponse.json(
      { error: 'Provide notificationIds or set markAllRead: true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
