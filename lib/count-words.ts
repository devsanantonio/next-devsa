const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

/**
 * A live count written out, for copy that opens a sentence or a headline:
 * "Twenty-five tech groups…" on /about, "Twenty-Five Groups." on
 * /buildingtogether. Both read the directory, so neither goes stale the way the
 * hardcoded "Twenty-Three" did when two more groups joined.
 *
 * `title` capitalizes after the hyphen too, for headlines. Past 99 it falls
 * back to digits.
 */
export function countInWords(n: number, { title = false }: { title?: boolean } = {}): string {
  const word =
    n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "") : String(n)
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
  return title ? word.split("-").map(cap).join("-") : cap(word)
}
