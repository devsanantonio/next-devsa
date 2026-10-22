import { describe, expect, it } from "vitest"
import { buildWeeklyDigestPayload, eventTeaser, type DigestEvent } from "./discord"

/** Day fields of the digest, or none for an empty week. */
const fieldsOf = (events: DigestEvent[]) => {
  const embed = buildWeeklyDigestPayload(events).embeds[0]
  return { embed, fields: "fields" in embed ? embed.fields : [] }
}

describe("eventTeaser", () => {
  it("takes the first sentence, without markdown", () => {
    expect(eventTeaser("**Time for a spooky social!** Dress up is encouraged.")).toBe("Time for a spooky social!")
  })

  it("doesn't end a sentence at an abbreviation", () => {
    expect(eventTeaser("Meet at 110 E Houston St. 3rd floor. Parking is free.")).toBe(
      "Meet at 110 E Houston St. 3rd floor.",
    )
  })

  it("cuts a long sentence on a word", () => {
    const t = eventTeaser(`${"word ".repeat(40)}end.`)
    expect(t.length).toBeLessThanOrEqual(121)
    expect(t.endsWith("word…")).toBe(true)
  })

  it("is empty without a description", () => {
    expect(eventTeaser(undefined)).toBe("")
  })
})

const event = (i: number, description: string): DigestEvent => ({
  title: `Event ${i}`,
  slug: `event-${i}`,
  // Spread across the week, a few a day.
  date: new Date(Date.UTC(2026, 9, 26 + (i % 7), 23, 0)).toISOString(),
  venue: "Geekdom",
  communityName: "AWS User Group",
  description,
})

describe("buildWeeklyDigestPayload", () => {
  it("puts the host first and in bold, and the teaser under it", () => {
    const value = fieldsOf([event(0, "A card game night. Bring friends.")]).fields[0].value
    expect(value).toContain("\n**AWS User Group** · Geekdom\nA card game night.")
    expect(value).not.toContain("Bring friends")
  })

  it("uses the organizer's summary over the first sentence", () => {
    const value = fieldsOf([{ ...event(0, "Looking for a night out? Come by."), summary: "A data networking night." }])
      .fields[0].value
    expect(value).toContain("\nA data networking night.")
    expect(value).not.toContain("Looking for")
  })

  it("drops teasers rather than events on a heavy week", () => {
    const long = `${"Hands-on cloud labs and lightning talks for every level ".repeat(3)}.`
    const events = Array.from({ length: 30 }, (_, i) => event(i, long))
    const { embed, fields } = fieldsOf(events)
    expect(fields.map(f => f.value).join("\n")).not.toContain("Hands-on")
    expect(embed.description).not.toContain("more this week")
  })
})
