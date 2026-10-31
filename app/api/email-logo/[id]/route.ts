import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getDb, COLLECTIONS } from '@/lib/firebase-admin';
import { EMAIL_WHITE_MARKS, EMAIL_LOGO_OVERRIDE } from '@/lib/email-logo';

export const runtime = 'nodejs';

/**
 * A community group's logo as a PNG, for email (lib/email-logo.ts). Mail clients
 * won't show SVG or (in Outlook) WebP, and can't invert a dark mark with CSS, so
 * this does it once, server-side: 160px square, transparent, the mark centered.
 *
 * Public and cached, since emails load it whenever they're opened. It only ever
 * fetches the logo recorded on the group, and only from the two places the admin
 * uploads to, so the id can't be used to make the server fetch anything else.
 */
const ALLOWED_HOSTS = [/\.public\.blob\.vercel-storage\.com$/, /^devsa-assets\.s3\.us-east-2\.amazonaws\.com$/];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const doc = await getDb().collection(COLLECTIONS.COMMUNITIES).doc(id).get();
    const logo = EMAIL_LOGO_OVERRIDE[id] ?? (doc.exists ? (doc.data()?.logo as string | undefined) : undefined);
    if (!logo) return new NextResponse('Not found', { status: 404 });

    let input: Buffer;
    if (logo.startsWith('/')) {
      input = await readFile(path.join(process.cwd(), 'public', path.normalize(logo).replace(/^(\.\.[/\\])+/, '')));
    } else {
      const url = new URL(logo);
      if (url.protocol !== 'https:' || !ALLOWED_HOSTS.some((h) => h.test(url.hostname))) {
        return new NextResponse('Not found', { status: 404 });
      }
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return new NextResponse('Not found', { status: 404 });
      input = Buffer.from(await res.arrayBuffer());
    }

    let img = sharp(input, { density: 300 }).resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha();
    if (EMAIL_WHITE_MARKS.includes(id)) {
      // Keep the shape (the alpha channel); paint every pixel of it white.
      const alpha = await img.clone().extractChannel('alpha').raw().toBuffer();
      img = sharp({ create: { width: 160, height: 160, channels: 3, background: '#ffffff' } }).joinChannel(alpha, { raw: { width: 160, height: 160, channels: 1 } });
    }
    const png = await img.png().toBuffer();

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Email logo failed for %s:', id, error);
    return new NextResponse('Not found', { status: 404 });
  }
}
