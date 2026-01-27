import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import type { AIConferenceSpeaker, AIConferenceSession, AIConferenceSponsor } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getDb();

    // Fetch confirmed speakers (filter in query, sort client-side to avoid composite index)
    const speakersSnapshot = await db
      .collection(COLLECTIONS.AI_CONFERENCE_SPEAKERS)
      .where('status', '==', 'confirmed')
      .get();

    const speakers = speakersSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as AIConferenceSpeaker),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Fetch scheduled sessions (filter in query, sort client-side to avoid composite index)
    const sessionsSnapshot = await db
      .collection(COLLECTIONS.AI_CONFERENCE_SESSIONS)
      .where('status', '==', 'scheduled')
      .get();

    const sessions = sessionsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as AIConferenceSession),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Fetch sponsors (no filter, can use orderBy directly)
    const sponsorsSnapshot = await db
      .collection(COLLECTIONS.AI_CONFERENCE_SPONSORS)
      .orderBy('order', 'asc')
      .get();

    const sponsors = sponsorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as AIConferenceSponsor),
    }));

    return NextResponse.json({
      speakers,
      sessions,
      sponsors,
    });
  } catch (error) {
    console.error('AI Conference data fetch error:', error);
    // Return empty arrays if no data yet
    return NextResponse.json({
      speakers: [],
      sessions: [],
      sponsors: [],
    });
  }
}
