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

let cached: OgFont[] | null = null

export async function loadBrandFonts(): Promise<OgFont[]> {
  if (cached) return cached

  const load = (file: string) =>
    readFile(fileURLToPath(new URL(`./og-fonts/${file}`, import.meta.url)))

  const [regular, medium, bold, black] = await Promise.all([
    load("Geist-Regular.ttf"),
    load("Geist-Medium.ttf"),
    load("Geist-Bold.ttf"),
    load("Geist-Black.ttf"),
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

  const load = (file: string) =>
    readFile(fileURLToPath(new URL(`./og-fonts/${file}`, import.meta.url)))

  const [regular, medium, semibold] = await Promise.all([
    load("GeistMono-Regular.ttf"),
    load("GeistMono-Medium.ttf"),
    load("GeistMono-SemiBold.ttf"),
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

  const load = (file: string) =>
    readFile(fileURLToPath(new URL(`./og-fonts/${file}`, import.meta.url)))

  const [brand, medium, bold] = await Promise.all([
    loadBrandFonts(),
    load("Oswald-500.ttf"),
    load("Oswald-700.ttf"),
  ])

  cachedDisplay = [
    ...brand,
    { name: "Oswald", data: medium, weight: 500, style: "normal" },
    { name: "Oswald", data: bold, weight: 700, style: "normal" },
  ]
  return cachedDisplay
}
