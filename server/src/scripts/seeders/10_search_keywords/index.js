const { createsearchwords } = require('../../../classes/search')
const sites = require('../../page_indexer/data')
const data = require('./data.json')

/**
 * This script uploads a static copy of the search key words per public web page,
 * which are originally the loaded and scraped text content of the live (dev or production) client website pages using puppeteer.
 * The scraped text content is uploaded to Firestore on FIRESTORE_COLLECTIONS.PAGE_SEARCH for reference on static full text search on the upper menu's search bar.
 * This script will upload default search keywords until the automatic updater (npm run build:page_index) can be set up.
 */

const getPageName = (path) => {
  if (path === '/') {
    return 'index'
  } else {
    return path.replace(/\//g, '-')
  }
}

const start = async () => {
  const promises = []
  console.log('[PROCESS]: Building a static search words data set...')

  // Build the raw data
  const saveData = sites.reduce((list, page) => {
    page.page = page.path
    page.content = data[page.path]
    return [...list, page]
  }, [])

  try {
    console.log('[PROCESS]: Saving static data to Firestore...')

    saveData.forEach(item => {
      promises.push(createsearchwords({
        page: getPageName(item.page),
        path: item.path,
        name: item.name,
        info: item.info,
        content: item.content
      }))
    })

    await Promise.all(promises)
    console.log('[PROCESS]: Firestore upload succeess.')
  } catch (err) {
    console.log('[ERROR]: ', err.message)
    process.exit(1)
  }
}

(async () => {
  await start()
})()
