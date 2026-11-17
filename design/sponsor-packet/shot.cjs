// Renders packet.html to one PNG per page, into ~/Downloads.   node design/sponsor-packet/shot.cjs
const path = require('path')
const puppeteer = require(path.join(process.env.HOME, 'Downloads/devsa-fm/node_modules/puppeteer-core'))
;(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] })
  const pg = await b.newPage(); await pg.setViewport({ width: 2000, height: 1200 })
  await pg.goto('file://' + path.join(__dirname, 'packet.html'), { waitUntil: 'networkidle0' })
  await pg.evaluate(() => document.fonts.ready)
  const n = await pg.$$eval('.slide', (s) => s.length)
  for (let i = 1; i <= n; i++) { const el = await pg.$('#s' + i); await el.screenshot({ path: path.join(process.env.HOME, 'Downloads', `devsa-sponsor-packet-${String(i).padStart(2, '0')}.png`) }) }
  await b.close(); console.log(n, 'pages')
})()
