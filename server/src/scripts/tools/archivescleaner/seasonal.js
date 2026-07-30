const ArchivesCleaner = require('./lib/archivescleaner')
const diff = require('./lib/diff')
const { FIRESTORE_COLLECTIONS, PROVINCE_LIST } = require('../../../utils/constants')

const MAX_MONTHS = 6

/**
 * Deletes archived seasonal weather forecast documents that are older than MAX_MONTHS.
 * Call this script in a cron job at the 1st day of every month.
 */
const cleanSeasonalArchives = async () => {
  try {
    const cleaner = new ArchivesCleaner({
      listPath: `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES}/${FIRESTORE_COLLECTIONS.SEASONAL}`,
      maxItems: MAX_MONTHS * 30
    })

    await cleaner.init()

    // Find old data (older than 6 months)
    const oldData = cleaner.itemlist.filter(date => {
      // Construct date
      const fullDate = `${date}-22`
      const difference = diff(fullDate, 'month')
      return (difference > MAX_MONTHS)
    })

    cleaner.logMessage(`Loaded (${cleaner.itemlist.length}) document names`)
    cleaner.logMessage(`Found (${oldData.length}) documents older than ${MAX_MONTHS} months`)

    // Batch delete multiple documents for all provinces
    const queryDelete = []

    PROVINCE_LIST.forEach(province => {
      queryDelete.push(cleaner.batchDeleteItemPair(province, oldData))
    })

    await Promise.all(queryDelete)
    cleaner.logMessage('Done.')
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = cleanSeasonalArchives
