import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { shareYouTubeToDiscord, isYouTubeDiscordConfigured } from '@/lib/discord';

const CRON_SECRET = process.env.CRON_SECRET;

// Only post content published on or after this date
const CUTOFF_DATE = new Date('2026-03-19T00:00:00Z');

const YOUTUBE_CHANNELS = [
  { channelId: 'UCsBjURrPoezykLs9EqgamOA', name: 'Fireship' },
  { channelId: 'UCbRP3c757lWg9M-U7TyEkXA', name: 'Theo' },
  { channelId: 'UCLq8gNoee7oXM7MvTdjyQvA', name: 'Vercel' },
  { channelId: 'UCUyeluBRhGPCW4rPe_UvBZQ', name: 'ThePrimeTime' },
  { channelId: 'UCUkM9uMpWatT7gVWShgtKFw', name: 'DHH' },
  { channelId: 'UCsUalyRg43M8D60mtHe6YcA', name: 'Cult Repo' },
  { channelId: 'UCyU5wkjgQYGRB0hIHMwm2Sg', name: 'Syntax.fm' },
  { channelId: 'UC7c3Kb6jYCRj4JOHHZTxKsQ', name: 'GitHub' },
  { channelId: 'UCbixkBITOOa2XNviJLxMh2w', name: 'Aaron Francis' },
  { channelId: 'UCnty0z0pNRDgnuoirYXnC5A', name: 'Code.tv' },
  { channelId: 'UCevUmOfLTUX9MNGJQKsPdIA', name: 'NeetCode' },
  { channelId: 'UCrDwWp7EBBv4NwvScIpBDOA', name: 'Anthropic' },
  { channelId: 'UC6YYHJzM6PhZ2Yey9BQiUaw', name: 'Cursor' },
  { channelId: 'UCXZCJLdBC09xxGZ6gcdrc6A', name: 'OpenAI' },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isYouTubeDiscordConfigured()) {
    return NextResponse.json({ error: 'Discord YouTube webhook not configured' }, { status: 500 });
  }

  try {
    const db = getDb();
    const parser = new Parser();
    let totalShared = 0;

    for (const channel of YOUTUBE_CHANNELS) {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;

      let parsed;
      try {
        const res = await fetch(feedUrl);
        const xml = await res.text();
        parsed = await parser.parseString(xml);
      } catch (err) {
        console.error(`Failed to fetch YouTube feed for ${channel.name}:`, err);
        continue;
      }

      // Only check the 3 most recent videos per channel
      const recentItems = (parsed.items || []).slice(0, 3);

      for (const item of recentItems) {
        if (!item.link || !item.title) continue;

        // Skip videos published before the cutoff date
        const pubDate = item.pubDate || item.isoDate;
        if (pubDate && new Date(pubDate) < CUTOFF_DATE) continue;

        const videoId = item.id?.replace('yt:video:', '') || '';
        const docId = Buffer.from(item.link).toString('base64url');

        const existing = await db
          .collection(COLLECTIONS.YOUTUBE_VIDEOS)
          .doc(docId)
          .get();

        if (existing.exists) continue;

        const thumbnailUrl = videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : undefined;

        await shareYouTubeToDiscord({
          title: item.title,
          url: item.link,
          channel: channel.name,
          description: item.contentSnippet || item.content || item.title,
          thumbnailUrl,
        });

        await db.collection(COLLECTIONS.YOUTUBE_VIDEOS).doc(docId).set({
          url: item.link,
          title: item.title,
          channel: channel.name,
          postedAt: new Date(),
        });

        // Delay between posts to avoid Discord rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
        totalShared++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Shared ${totalShared} new video${totalShared !== 1 ? 's' : ''}`,
      count: totalShared,
    });
  } catch (error) {
    console.error('YouTube digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
