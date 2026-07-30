const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const main = async () => {
  // Create a browser instance
  const browser = await puppeteer.launch()

  // Create a new page
  const page = await browser.newPage()

  // Get HTML content from HTML file
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'utils', 'pdf', 'templates', 'pdf-tenday.ejs'), 'utf-8')
  await page.setContent(html, { waitUntil: 'domcontentloaded' })

  // To reflect CSS used for screens instead of print
  // await page.emulateMediaType('screen');

  // Downlaod the PDF
  /*
  const pdf = await page.pdf({
    path: 'result.pdf',
    margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
    printBackground: true,
    format: 'A4',
  });
  */

  const pdf = await page.createPDFStream({
    path: 'resultstream.pdf',
    format: 'A4',
    printBackground: true
    // pageRanges: '1,1'
  })

  pdf
    .on('finish', async () => {
      console.log('done')
    })
    .on('error', async (err) => {
      console.log('error')
      console.log(err)
    })

  // Close the browser instance
  await browser.close()
}

main()
