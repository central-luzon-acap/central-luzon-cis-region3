const ArchivesCleaner = require('./lib/archivescleaner')
const diff = require('./lib/diff')
const { FIRESTORE_COLLECTIONS, PROVINCE_LIST } = require('../../../utils/constants')

const MAX_MONTHS = 3

/**
 * Deletes archived 10-day weather forecast documents that are older than MAX_MONTHS.
 * Call this script in a cron job everyday after finishing running the "cron:tenday" process.
 */
const cleanTendayArchives = async () => {
  try {
    const cleaner = new ArchivesCleaner({
      listPath: `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES}/${FIRESTORE_COLLECTIONS.TEN_DAY}`,
      maxItems: MAX_MONTHS * 30
    })

    await cleaner.init()

    // Find old data (older than 3 months)
    const oldData = cleaner.itemlist.filter(date => diff(date, 'month') > MAX_MONTHS)

    cleaner.logMessage(`Loaded (${cleaner.itemlist.length}) document names`)
    cleaner.logMessage(`Found (${oldData.length}) documents older than ${MAX_MONTHS} months`)

    // Batch delete multiple documents for all provinces
    const queryDelete = []

    PROVINCE_LIST.forEach(province => {
      queryDelete.push(cleaner.batchDeleteItemPair(province, oldData))
    })

    await Promise.all(queryDelete)
    cleaner.logMessage('Done.')

    /**
     * Alternate usage
     * await cleaner.pushItem('hohoho')
     * await cleaner.deleteItemPair('Albay', 'hohoho')
     */
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = cleanTendayArchives
