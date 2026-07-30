require('dotenv').config()
const puppeteer = require('puppeteer')
const { createsearchwords } = require('../../classes/search')
const sites = require('./data')

/**
 * This script loads and scrapes text content of the live (dev or production) client website pages using puppeteer.
 * The scraped text content is uploaded to Firestore on FIRESTORE_COLLECTIONS.PAGE_SEARCH for reference
 * on static full text search
 */

const baseUrl = process.env.LIVE_ORIGIN

const scrape_puppeteer = async (pageIndex) => {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Set to true. Setting to false will launch a web browwer
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox']
    })

    const page = await browser.newPage()
    const route = (sites[pageIndex].path === '/') ? '/' : `/${sites[pageIndex].path}`
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle2' })

    const selectors = []
    sites[pageIndex].selectors.forEach((item, index) => {
      selectors.push(item)
    })

    await Promise.all(selectors)

    const extractedText = await page.$eval('*', (el) => el.innerText)
    await browser.close()
    return extractedText.replace(/\n/g, ',')
  } catch (err) {
    throw new Error(err.message)
  }
}

const start = async () => {
  const promises = []
  const saveData = []
  let data = []

  console.log('[PROCESS]: Scraping live pages...')

  sites.forEach((page, index) => {
    promises.push(scrape_puppeteer(index))
  })

  try {
    data = await Promise.all(promises)
    console.log('[LOG]: Extracted words:')
    console.log(data)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    throw new Error(err.message)
  }

  if (!data.includes(undefined)) {
    try {
      console.log('[PROCESS]: Saving scraped data to Firestore...')
      sites.forEach((page, index) => {
        let tempPage = (page.path === '/') ? 'index' : page.path

        if ((page.path !== '/') && tempPage.includes('/')) {
          // Replace "/" characters with "-" to use page.path as a Firestore document name
          tempPage = tempPage.replace(/\//g, '-')
        }

        saveData.push(createsearchwords({
          page: tempPage,
          path: page.path,
          name: sites[index].name,
          info: sites[index].info,
          content: data[index]
        }))
      })

      await Promise.all(saveData)
      console.log('[PROCESS]: Firestore upload succeess.')
      process.exit(0)
    } catch (err) {
      console.log(`[ERROR]: ${err.message}`)
      throw new Error(err.message)
    }
  } else {
    const errMsg = '[ERROR]: Extracted data contains undefined values.'
    console.log(errMsg)
    throw new Error(errMsg)
  }
}

(async () => {
  await start()
  // testServer.close()
})()
