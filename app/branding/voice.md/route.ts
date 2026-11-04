import { voiceMarkdown } from "@/lib/brand-voice"

// DEVSA's voice and messaging as plain Markdown, from the same module the
// branding kit renders, so anything that writes for DEVSA (a person pasting
// into a grant form, or an agent) reads the same rules. See lib/brand-voice.ts.
export const dynamic = "force-static"

export function GET() {
  return new Response(voiceMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
