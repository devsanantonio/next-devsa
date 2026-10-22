import { describe, expect, it } from "vitest"
import { eventDescriptionToPlainText, parseEventInline, parseEventMarkdown } from "./event-markdown"

const invite = `Every group. One room.

What we'll cover

• Introductions from every group
• DEVSA's goals for 2027

**Come ready to introduce your group.** Join us on [Discord](https://www.devsa.community/discord).`

describe("parseEventMarkdown", () => {
  it("reads pasted bullet glyphs as a list", () => {
    expect(parseEventMarkdown(invite)).toEqual([
      { type: "paragraph", text: "Every group. One room." },
      { type: "paragraph", text: "What we'll cover" },
      { type: "ul", items: ["Introductions from every group", "DEVSA's goals for 2027"] },
      { type: "paragraph", text: "**Come ready to introduce your group.** Join us on [Discord](https://www.devsa.community/discord)." },
    ])
  })

  it("reads headings and numbered lists, keeping the start number", () => {
    expect(parseEventMarkdown("## Agenda\n3. Doors\n4) Talks")).toEqual([
      { type: "heading", text: "Agenda" },
      { type: "ol", start: 3, items: ["Doors", "Talks"] },
    ])
  })

  it("does not mistake italics or a negative number for a bullet", () => {
    expect(parseEventMarkdown("*Bring a laptop*\n-5°F outside")).toEqual([
      { type: "paragraph", text: "*Bring a laptop*" },
      { type: "paragraph", text: "-5°F outside" },
    ])
  })
})

describe("parseEventInline", () => {
  it("links bare URLs without swallowing trailing punctuation", () => {
    expect(parseEventInline("RSVP at https://lu.ma/devsa.")).toEqual([
      { type: "text", text: "RSVP at " },
      { type: "link", text: "https://lu.ma/devsa", href: "https://lu.ma/devsa" },
      { type: "text", text: "." },
    ])
  })

  it("drops links that aren't web or mail", () => {
    expect(parseEventInline("[x](javascript:alert(1))")[0]).toEqual({ type: "text", text: "x" })
  })

  it("leaves arithmetic alone", () => {
    expect(parseEventInline("5 * 3 * 2")).toEqual([{ type: "text", text: "5 * 3 * 2" }])
  })
})

describe("eventDescriptionToPlainText", () => {
  it("keeps the shape, without syntax, for calendar notes", () => {
    expect(eventDescriptionToPlainText(invite)).toBe(
      "Every group. One room.\n\nWhat we'll cover\n\n• Introductions from every group\n• DEVSA's goals for 2027\n\n" +
        "Come ready to introduce your group. Join us on Discord (https://www.devsa.community/discord).",
    )
  })

  it("collapses to one line of prose for cards and feeds", () => {
    expect(eventDescriptionToPlainText(invite, { singleLine: true })).toBe(
      "Every group. One room. What we'll cover. Introductions from every group; DEVSA's goals for 2027. " +
        "Come ready to introduce your group. Join us on Discord.",
    )
  })
})
