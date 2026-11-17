// Renders packet.html to public/sponsor/devsa-sponsor-packet-2027.pdf: one 1920x1080 page per slide, vector text.
// Needs puppeteer-core and Chrome:  node design/sponsor-packet/pdf.cjs
const path = require('path')
const puppeteer = require(path.join(process.env.HOME, 'Downloads/devsa-fm/node_modules/puppeteer-core'))
;(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] })
  const pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 })
  await pg.goto('file://' + path.join(__dirname, 'packet.html'), { waitUntil: 'networkidle0' })
  await pg.evaluate(() => document.fonts.ready)
  await pg.addStyleTag({ content: '@page { size: 1920px 1080px; margin: 0 } body { background: #0a0a0a !important } .slide { margin: 0 !important; break-after: page; page-break-after: always } .slide:last-child { break-after: auto }' })
  await pg.pdf({ path: path.join(__dirname, '../../public/sponsor/devsa-sponsor-packet-2027.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true })
  await b.close(); console.log('ok')
})()
