/**
 * Profile photos for admin accounts: shown on the account button and, for
 * people in the organizer directory, beside their name there. Signed-in
 * admins only; never the public site.
 *
 * Photos live in Vercel Blob under `profiles/`, uploaded through
 * /api/upload with `purpose=profile`, which files them under the signed-in
 * person's own admin record and writes the record itself. Nothing else can
 * set `profileImage`: the profile save only accepts `null` (remove). So the
 * one test below is the whole trust boundary — a URL that isn't one of our
 * own profile blobs is never stored and never rendered.
 *
 * Kept free of server-only imports: the admin page crops with it too.
 */

export const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
/** The square the browser crops to before upload: sharp at 2x on a 48px avatar, about 20 KB. */
export const PROFILE_PHOTO_SIZE = 256

export function isProfilePhotoUrl(url: unknown): url is string {
  if (typeof url !== "string") return false
  try {
    const u = new URL(url)
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com") &&
      u.pathname.startsWith("/profiles/")
    )
  } catch {
    return false
  }
}

/**
 * Centre-crop an image to a square and scale it to PROFILE_PHOTO_SIZE, in the
 * browser. WebP where the browser can encode it, JPEG where it can't (older
 * Safari). `createImageBitmap` applies the photo's EXIF rotation, so a phone
 * picture comes out the right way up.
 */
export async function squareProfilePhoto(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = PROFILE_PHOTO_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PROFILE_PHOTO_SIZE,
    PROFILE_PHOTO_SIZE
  )
  bitmap.close()
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
  const webp = await encode("image/webp", 0.85)
  if (webp && webp.type === "image/webp") return webp
  const jpeg = await encode("image/jpeg", 0.88)
  if (!jpeg) throw new Error("Couldn't encode the photo")
  return jpeg
}
