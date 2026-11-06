// Renders the Election Day stickers: a 3x still PNG for Stories and a frame sequence per sticker,
// to encode as a transparent looping GIF for GIPHY.
//   node vote.cjs <out-dir> [one-sticker]
// then, per sticker, in <out-dir>:
//   ffmpeg -framerate 12 -i frames/<k>/%02d.png -filter_complex "[0:v]split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=alpha_threshold=128:dither=bayer:bayer_scale=4" -loop 0 devsa-vote-<k>.gif
// The mission-bell and YO VOTÉ stickers were cut on 2026-11-02; their drawings are still in vote.html.
const path = require('path'), fs = require('fs'), os = require('os')
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core')
const ICONS = process.env.COSA_ICONS || path.join(require('os').homedir(), 'Downloads', 'cosa-icons', 'SVG')
// name, frames per loop, the frame kept as the still, the City icon it draws
const SET = [['papel', 24, 3, null], ['ascii', 30, 20, null], ['burst', 24, 6, null], ['tower', 24, 0, 'tower'], ['pixel', 24, 2, null]]
;(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'devsa-vote-'))
  const br = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', userDataDir: prof, args: ['--allow-file-access-from-files'] })
  try {
    const out = process.argv[2], only = process.argv[3]
    const p = await br.newPage()
    for (const [k, n, still, icon] of SET) {
      if (only && only !== k) continue
      const svg = icon ? fs.readFileSync(`${ICONS}/${icon}.svg`, 'utf8') : ''
      await p.evaluateOnNewDocument((s) => { window.ICON = s }, svg)
      const shot = async (f, file, scale) => {
        await p.setViewport({ width: 800, height: 800, deviceScaleFactor: scale })
        await p.goto('file://' + path.join(__dirname, 'vote.html') + `?k=${k}&f=${f}&n=${n}`, { waitUntil: 'networkidle0' })
        await p.evaluate(() => document.fonts.ready)
        const [w, h] = await p.evaluate(() => window.SIZE)
        await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } })
      }
      fs.mkdirSync(`${out}/frames/${k}`, { recursive: true })
      await shot(still, `${out}/devsa-vote-${k}.png`, 3)
      for (let f = 0; f < n; f++) await shot(f, `${out}/frames/${k}/${String(f).padStart(2, '0')}.png`, 1.25)
    }
  } finally { await br.close(); fs.rmSync(prof, { recursive: true, force: true }) }
})()
