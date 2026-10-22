import { parseEventInline, parseEventMarkdown } from "@/lib/event-markdown"

/**
 * An event description as attendees see it. The event page renders it, and so
 * does the admin editor's Preview tab, so what an organizer previews is what
 * goes out — not a second renderer that has to be kept in step.
 */
export function EventDescription({ text }: { text: string }) {
  return (
    <div>
      {parseEventMarkdown(text).map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3 key={i} className="text-lg font-bold tracking-tight text-gray-900 mt-8 mb-3 first:mt-0">
                <Inline text={block.text} />
              </h3>
            )
          case "ul":
            return (
              <ul key={i} className="list-disc pl-5 space-y-1.5 my-4 marker:text-gray-400">
                {block.items.map((item, j) => (
                  <li key={j} className="text-[15px] text-gray-600 leading-relaxed pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} start={block.start} className="list-decimal pl-5 space-y-1.5 my-4 marker:text-gray-400">
                {block.items.map((item, j) => (
                  <li key={j} className="text-[15px] text-gray-600 leading-relaxed pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            )
          default:
            return (
              <p key={i} className="text-[15px] text-gray-600 leading-[1.75] mb-3 last:mb-0">
                <Inline text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseEventInline(text).map((part, i) => {
        switch (part.type) {
          case "bold":
            return <strong key={i} className="font-semibold text-gray-800">{part.text}</strong>
          case "italic":
            return <em key={i} className="italic">{part.text}</em>
          case "link":
            return (
              <a
                key={i}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ef426f] hover:text-[#d63760] underline underline-offset-2 font-medium break-words"
              >
                {part.text}
              </a>
            )
          default:
            return part.text
        }
      })}
    </>
  )
}
