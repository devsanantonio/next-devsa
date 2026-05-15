import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS, type JobListing } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsa.community';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const typeLabels: Record<string, string> = {
  w2: 'W-2 Employment',
  '1099': '1099 Contract',
  equity: 'Co-founder / Equity',
  internship: 'Internship / Apprenticeship',
  other: 'Other',
};

const locationLabels: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
};

export async function GET() {
  try {
    const db = getDb();
    const now = new Date();

    const snapshot = await db.collection(COLLECTIONS.JOB_LISTINGS).get();

    const jobs = snapshot.docs
      .map(doc => {
        const data = doc.data() as Omit<JobListing, 'id'>;
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.() || new Date(),
          expiresAt: (data.expiresAt as unknown as { toDate?: () => Date })?.toDate?.() || null,
        };
      })
      // Only published, non-expired listings
      .filter(job => {
        if (job.status !== 'published') return false;
        if (job.expiresAt && job.expiresAt < now) return false;
        return true;
      })
      // Newest first
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const lastBuildDate = new Date().toUTCString();

    const items = jobs.map(job => {
      const jobUrl = `${SITE_URL}/bounties/${job.slug}`;
      const typeLabel = typeLabels[job.type] || job.type;
      const locationLabel = locationLabels[job.locationType] || job.locationType;
      const locationValue = `${locationLabel}${job.location ? ` · ${job.location}` : ''}`;

      const plainDescription = stripHtml(job.description);

      const descriptionParts = [
        `${job.companyName}`,
        typeLabel,
        locationValue,
      ];
      if (job.salaryRange) descriptionParts.push(job.salaryRange);
      if (job.tags.length > 0) descriptionParts.push(job.tags.slice(0, 6).join(', '));
      if (plainDescription) descriptionParts.push(plainDescription.slice(0, 300));

      const pubDate = job.createdAt.toUTCString();

      return `    <item>
      <title>${escapeXml(`${job.title} at ${job.companyName}`)}</title>
      <link>${escapeXml(jobUrl)}</link>
      <guid isPermaLink="true">${escapeXml(jobUrl)}</guid>
      <description>${escapeXml(descriptionParts.join(' · '))}</description>
      <pubDate>${pubDate}</pubDate>
      <source url="${escapeXml(`${SITE_URL}/api/bounties/feed`)}">DEVSA Bounties</source>
      <category>${escapeXml(typeLabel)}</category>
      <category>${escapeXml(locationLabel)}</category>
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DEVSA Bounties</title>
    <link>${SITE_URL}/bounties</link>
    <atom:link href="${SITE_URL}/api/bounties/feed" rel="self" type="application/rss+xml" />
    <description>Local work, local talent. DEVSA Bounties connects local nonprofits and startups with builders across San Antonio, the I-35 corridor, and the Rio Grande Valley. Bite-sized dev projects, paid on delivery.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>devsa.community</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <image>
      <url>${SITE_URL}/devsa-logo.png</url>
      <title>DEVSA Bounties</title>
      <link>${SITE_URL}/bounties</link>
    </image>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Jobs RSS feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
