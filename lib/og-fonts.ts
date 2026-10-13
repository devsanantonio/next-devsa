import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

// Brand typography for Open Graph cards. Geist Sans matches the site's body font
// so shared cards read in the same typeface as the app. TTFs are bundled in
// lib/og-fonts/ and referenced via import.meta.url so Next traces them into the
// serverless bundle. Weights are declared to match how the cards use them
// (400 body, 500 stats, 700 host/labels, 800 headline → Geist Black).

type OgFont = {
  name: string
  data: Buffer
  weight: 400 | 500 | 600 | 700 | 800
  style: "normal"
}

/*
 * One literal `new URL("./og-fonts/<file>", import.meta.url)` per file, never
 * a template. Turbopack resolves a URL built from `${file}` to a single asset
 * for every call, so the loaders used to read Geist Black nine times over:
 * every OG card on the site was set in Black at every weight, the Geist Mono
 * cards fell back to it, and the Oswald conference titles were never Oswald.
 * A literal is what lets the bundler trace each file to its own asset.
 */
const read = (url: URL) => readFile(fileURLToPath(url))

let cached: OgFont[] | null = null

export async function loadBrandFonts(): Promise<OgFont[]> {
  if (cached) return cached

  const [regular, medium, bold, black] = await Promise.all([
    read(new URL("./og-fonts/Geist-Regular.ttf", import.meta.url)),
    read(new URL("./og-fonts/Geist-Medium.ttf", import.meta.url)),
    read(new URL("./og-fonts/Geist-Bold.ttf", import.meta.url)),
    read(new URL("./og-fonts/Geist-Black.ttf", import.meta.url)),
  ])

  cached = [
    { name: "Geist Sans", data: regular, weight: 400, style: "normal" },
    { name: "Geist Sans", data: medium, weight: 500, style: "normal" },
    { name: "Geist Sans", data: bold, weight: 700, style: "normal" },
    { name: "Geist Sans", data: black, weight: 800, style: "normal" },
  ]
  return cached
}

let cachedMono: OgFont[] | null = null

// Geist Mono — the site's monospace face — for OG cards with a terminal/mono
// aesthetic (e.g. the zero-to-agent event card).
export async function loadBrandMonoFonts(): Promise<OgFont[]> {
  if (cachedMono) return cachedMono

  const [regular, medium, semibold] = await Promise.all([
    read(new URL("./og-fonts/GeistMono-Regular.ttf", import.meta.url)),
    read(new URL("./og-fonts/GeistMono-Medium.ttf", import.meta.url)),
    read(new URL("./og-fonts/GeistMono-SemiBold.ttf", import.meta.url)),
  ])

  cachedMono = [
    { name: "Geist Mono", data: regular, weight: 400, style: "normal" },
    { name: "Geist Mono", data: medium, weight: 500, style: "normal" },
    { name: "Geist Mono", data: semibold, weight: 600, style: "normal" },
  ]
  return cachedMono
}

/**
 * Oswald, for the conference cards.
 *
 * Oswald is the display face the Startup + Tech Week activations are set in,
 * and Access Granted's wordmark is specified as Oswald bold uppercase. The app
 * reaches it through next/font/google, which gives a hashed CSS family name and
 * no file — useless to Satori, which needs the actual bytes. So the TTFs are
 * bundled here beside Geist and loaded the same way.
 *
 * Returned alongside Geist rather than instead of it: a conference card sets
 * its title in Oswald and its hook in Geist, which is the split the site makes
 * between display and body.
 */
let cachedDisplay: OgFont[] | null = null

export async function loadDisplayFonts(): Promise<OgFont[]> {
  if (cachedDisplay) return cachedDisplay

  const [brand, medium, bold] = await Promise.all([
    loadBrandFonts(),
    read(new URL("./og-fonts/Oswald-500.ttf", import.meta.url)),
    read(new URL("./og-fonts/Oswald-700.ttf", import.meta.url)),
  ])

  cachedDisplay = [
    ...brand,
    { name: "Oswald", data: medium, weight: 500, style: "normal" },
    { name: "Oswald", data: bold, weight: 700, style: "normal" },
  ]
  return cachedDisplay
}
