import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { shareNewsToDiscord, isNewsDiscordConfigured } from '@/lib/discord';

const CRON_SECRET = process.env.CRON_SECRET;

// Only post content published on or after this date
const CUTOFF_DATE = new Date('2026-03-19T00:00:00Z');

const FEEDS = [
  { url: 'https://github.blog/feed/', source: 'GitHub' },
  { url: 'https://vercel.com/atom', source: 'Vercel' },
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI' },
  { url: 'https://blog.cloudflare.com/rss/', source: 'Cloudflare' },
  { url: 'https://blogs.nvidia.com/feed/', source: 'NVIDIA' },
  { url: 'https://aws.amazon.com/blogs/aws/feed/', source: 'AWS' },
  { url: 'https://developers.googleblog.com/feeds/posts/default', source: 'Google Developers' },
  { url: 'https://devblogs.microsoft.com/feed/', source: 'Microsoft' },
];

interface NewsArticle {
  title: string;
  link: string;
  summary: string;
  imageUrl?: string;
}

/** Scrape Cursor's blog page — their declared RSS feed returns 404 */
async function fetchCursorNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch('https://cursor.com/blog');
    const html = await res.text();

    const articles: NewsArticle[] = [];
    // Cursor embeds blog entries in Next.js RSC payloads as JSON objects
    const entryRegex = /"entry":\{"id":"([^"]+)","title":"([^"]+)","slug":"([^"]+)","date":"([^"]+)","excerpt":"([^"]*)"/g;
    let match;
    while ((match = entryRegex.exec(html)) !== null) {
      const [, , title, slug, date, excerpt] = match;
      const published = new Date(date);
      if (published < CUTOFF_DATE) continue;

      const link = `https://cursor.com/blog/${slug}`;
      // Deduplicate by link
      if (articles.some((a) => a.link === link)) continue;

      articles.push({
        title,
        link,
        summary: excerpt || title,
      });
    }

    return articles.slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch Cursor news:', err);
    return [];
  }
}

/** Scrape Anthropic's news page — they don't provide an RSS feed */
async function fetchAnthropicNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch('https://www.anthropic.com/news');
    const html = await res.text();

    // Anthropic embeds structured JSON in Next.js RSC payloads.
    // Extract post objects from the serialised JSON.
    const articles: NewsArticle[] = [];
    const postRegex = /"_type":"post","cardPhoto".*?"publishedOn":"([^"]+)".*?"slug":\{"_type":"slug","current":"([^"]+)"\}.*?"title":"([^"]+)"/g;
    let match;
    while ((match = postRegex.exec(html)) !== null) {
      const [, publishedOn, slug, title] = match;
      // Only include posts from the last 7 days
      const published = new Date(publishedOn);
      if (published < CUTOFF_DATE) continue;

      // Try to extract the card photo URL from the surrounding context
      const surroundingStart = Math.max(0, match.index - 200);
      const surrounding = html.slice(surroundingStart, match.index + match[0].length);
      const imgMatch = surrounding.match(/"url":"(https:\/\/cdn\.sanity\.io\/images\/[^"]+)"/);

      articles.push({
        title,
        link: `https://www.anthropic.com/news/${slug}`,
        summary: title,
        imageUrl: imgMatch?.[1],
      });
    }

    return articles.slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch Anthropic news:', err);
    return [];
  }
}

async function processArticle(
  db: FirebaseFirestore.Firestore,
  source: string,
  article: NewsArticle
): Promise<boolean> {
  const docId = Buffer.from(article.link).toString('base64url');
  const existing = await db
    .collection(COLLECTIONS.NEWS_ARTICLES)
    .doc(docId)
    .get();

  if (existing.exists) return false;

  await shareNewsToDiscord({
    title: article.title,
    url: article.link,
    source,
    summary: article.summary,
    imageUrl: article.imageUrl,
  });

  await db.collection(COLLECTIONS.NEWS_ARTICLES).doc(docId).set({
    url: article.link,
    title: article.title,
    source,
    postedAt: new Date(),
  });

  // Delay between posts to avoid Discord rate limiting
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isNewsDiscordConfigured()) {
    return NextResponse.json({ error: 'Discord news webhook not configured' }, { status: 500 });
  }

  try {
    const db = getDb();
    const parser = new Parser();
    let totalShared = 0;

    // Process RSS feeds
    for (const feed of FEEDS) {
      let parsed;
      try {
        // Fetch the feed manually so we can fix malformed XML (e.g. Vercel's <updated>null</updated>)
        const res = await fetch(feed.url);
        let xml = await res.text();
        xml = xml.replace(/<updated>null<\/updated>/g, '');
        parsed = await parser.parseString(xml);
      } catch (err) {
        console.error(`Failed to fetch RSS feed for ${feed.source}:`, err);
        continue;
      }

      const recentItems = (parsed.items || []).slice(0, 5);

      for (const item of recentItems) {
        if (!item.link || !item.title) continue;

        // Skip articles published before the cutoff date
        const pubDate = item.pubDate || item.isoDate;
        if (pubDate && new Date(pubDate) < CUTOFF_DATE) continue;

        const imageUrl =
          item.enclosure?.url ||
          extractFirstImage(
            item['content:encoded'] || item.content || ''
          );

        let summary = item.contentSnippet || item.content || item.title;

        const posted = await processArticle(db, feed.source, {
          title: item.title,
          link: item.link,
          summary,
          imageUrl: imageUrl || undefined,
        });
        if (posted) totalShared++;
      }
    }

    // Process Anthropic (no RSS feed — scrape their news page)
    const anthropicArticles = await fetchAnthropicNews();
    for (const article of anthropicArticles) {
      const posted = await processArticle(db, 'Anthropic', article);
      if (posted) totalShared++;
    }

    // Process Cursor (declared RSS returns 404 — scrape their blog page)
    const cursorArticles = await fetchCursorNews();
    for (const article of cursorArticles) {
      const posted = await processArticle(db, 'Cursor', article);
      if (posted) totalShared++;
    }

    return NextResponse.json({
      success: true,
      message: `Shared ${totalShared} new article${totalShared !== 1 ? 's' : ''}`,
      count: totalShared,
    });
  } catch (error) {
    console.error('News digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || null;
}
