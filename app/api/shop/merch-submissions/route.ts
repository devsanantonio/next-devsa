import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getDb, COLLECTIONS } from '@/lib/firebase-admin'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 submissions per hour per IP
  const ip = getClientIp(request)
  const limit = rateLimit(ip, 5, 60 * 60 * 1000)
  if (!limit.success) return rateLimitResponse(limit.resetMs)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const communityName = (formData.get('communityName') as string)?.trim()
    const contactName = (formData.get('contactName') as string)?.trim()
    const contactEmail = (formData.get('contactEmail') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()

    if (!file || !communityName || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'Community name, contact name, email, and SVG file are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Only allow SVG files
    if (file.type !== 'image/svg+xml') {
      return NextResponse.json(
        { error: 'Only SVG files are accepted' },
        { status: 400 }
      )
    }

    // 2MB max for SVGs
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be under 2MB' },
        { status: 400 }
      )
    }

    // Sanitize community name for filename
    const safeName = communityName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const timestamp = Date.now()
    const filename = `merch-submissions/${safeName}-${timestamp}.svg`

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Save submission to Firestore
    const db = getDb()
    await db.collection(COLLECTIONS.MERCH_SUBMISSIONS).add({
      communityName,
      contactName,
      contactEmail: contactEmail.toLowerCase(),
      description: description || '',
      logoUrl: blob.url,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Merch submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const db = getDb()
    const snapshot = await db
      .collection(COLLECTIONS.MERCH_SUBMISSIONS)
      .orderBy('submittedAt', 'desc')
      .get()

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Failed to fetch merch submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
