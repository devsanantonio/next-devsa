import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyJobBoardUser } from '@/lib/auth-middleware';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  const result = await verifyJobBoardUser(request, { requireProfile: true });
  if (result instanceof NextResponse) return result;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'profile', 'project', 'company'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: JPEG, PNG, WebP, GIF, MP4, WebM' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${isVideo ? '50MB' : '5MB'}` },
        { status: 400 }
      );
    }

    // Determine storage path
    const ext = file.name.split('.').pop() || 'bin';
    let path: string;
    switch (uploadType) {
      case 'profile':
        path = `job-board/profiles/${result.uid}.${ext}`;
        break;
      case 'company':
        path = `job-board/companies/${result.uid}.${ext}`;
        break;
      case 'project':
        path = `job-board/projects/${result.uid}-${Date.now()}.${ext}`;
        break;
      default:
        path = `job-board/misc/${result.uid}-${Date.now()}.${ext}`;
    }

    const blob = await put(path, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
