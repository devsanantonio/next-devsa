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
