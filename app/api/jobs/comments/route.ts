import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobComment, type Notification } from '@/lib/firebase-admin';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

// GET - Get comments for a job listing (public)
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    // Avoid composite index requirement by sorting in-memory
    const snapshot = await db.collection(COLLECTIONS.JOB_COMMENTS)
      .where('jobId', '==', jobId)
      .get();

    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt;
      const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt;
      return { id: doc.id, ...data, createdAt, updatedAt };
    });

    // Sort by createdAt ascending in-memory
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a comment (authenticated users only)
export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const body = await request.json();
    const { jobId, content, mentions, parentCommentId } = body;

    if (!jobId || !content) {
      return NextResponse.json(
        { error: 'Job ID and content are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date();

    const comment: Omit<JobComment, 'id'> = {
      jobId,
      authorUid: result.uid,
      authorName: `${result.profile!.firstName} ${result.profile!.lastName}`,
      authorImage: result.profile!.profileImage,
      authorRole: result.profile!.role,
      content,
      mentions: mentions || [],
      parentCommentId: parentCommentId || null,
      createdAt: now,
    };

    const commentRef = await db.collection(COLLECTIONS.JOB_COMMENTS).add(comment);

    // Get the job listing to notify the author
    const jobDoc = await db.collection(COLLECTIONS.JOB_LISTINGS).doc(jobId).get();
    const jobData = jobDoc.exists ? jobDoc.data() : null;

    // Create notification for the job post author (if not the commenter)
    if (jobData && jobData.authorUid !== result.uid) {
      const notification: Omit<Notification, 'id'> = {
        recipientUid: jobData.authorUid,
        type: 'comment',
        title: 'New comment on your job post',
        body: `${comment.authorName} commented on "${jobData.title}"`,
        link: `/jobs/${jobData.slug}#comment-${commentRef.id}`,
        sourceUid: result.uid,
        sourceName: comment.authorName,
        referenceId: jobId,
        read: false,
        createdAt: now,
      };
      await db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);
    }

    // Create notifications for @mentioned users
    if (mentions && mentions.length > 0) {
      const mentionNotifications = mentions
        .filter((uid: string) => uid !== result.uid) // Don't notify yourself
        .map((mentionedUid: string) => {
          const notification: Omit<Notification, 'id'> = {
            recipientUid: mentionedUid,
            type: 'mention',
            title: 'You were mentioned in a comment',
            body: `${comment.authorName} mentioned you on "${jobData?.title || 'a job post'}"`,
            link: `/jobs/${jobData?.slug || jobId}#comment-${commentRef.id}`,
            sourceUid: result.uid,
            sourceName: comment.authorName,
            referenceId: jobId,
            read: false,
            createdAt: now,
          };
          return db.collection(COLLECTIONS.NOTIFICATIONS).add(notification);
        });

      await Promise.all(mentionNotifications);
    }

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      id: commentRef.id,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment (author or superadmin)
export async function DELETE(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.JOB_COMMENTS).doc(commentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const commentData = doc.data() as JobComment;
    const isSuperAdmin = result.email.toLowerCase() === 'jesse@devsanantonio.com';

    if (commentData.authorUid !== result.uid && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
