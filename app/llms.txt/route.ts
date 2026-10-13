import { buildLlmsText } from "@/lib/llms"

// Built from the directory on each request, like every public surface here,
// so a group added in the admin is in it immediately. See lib/llms.ts.
export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(await buildLlmsText({ full: false }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
