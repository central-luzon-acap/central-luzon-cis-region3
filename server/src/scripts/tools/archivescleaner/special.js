const { db } = require('../../../utils/db')
const { dayjsUTC } = require('../../../utils/dayjs_utc')
const diff = require('./lib/diff')

const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS, MONTHS } = require('../../../utils/constants')
const { getArchivedSpecialForecast } = require('../../../classes/sharedweatherforecast/special')

const MAX_MONTHS = 3

/**
 * Deletes archived special (severe cyclone) weather forecast documents that are older than MAX_MONTHS.
 * Call this script in a cron job at the 1st day of every month.
 */
const cleanSpecialArchives = async () => {
  try {
    logMessage(`Cleaning the archived special weather data on ${logDateNow()}`)

    // Fetch all special weather forecast archives
    const cycloneData = await getArchivedSpecialForecast({})

    // Update the main docs by deleting old data from the internal "data[]" array.
    // Extract main docs which had old data.
    const withOldData = cycloneData.reduce((list, record) => {
      const hasOutdated = []

      record.data = record.data.reduce((validlist, item) => {
        const difference = diff(item.date_created_str, 'month')

        if (difference <= MAX_MONTHS) {
          return [...validlist, item]
        } else {
          hasOutdated.push(item.date_created_str)
          logMessage(`Found old data on ${item.date_created_str}`)
          return validlist
        }
      }, [])

      if (hasOutdated.length > 0) {
        list.push(record)
        return list
      } else {
        return list
      }
    }, [])

    // Update the documents' "forecast_dates[]" and "months[]" arrays
    const monthCodes = Object.keys(MONTHS)

    withOldData.forEach((item) => {
      // Find local "data[]" month codes
      const localmonths = item.data
        .map(x => x.date_created_str)
        .filter((x, i, a) => a.indexOf(x) === i)
        .map(stringDate => monthCodes[new Date(stringDate).getMonth()])

      // Find local "data[]" date_created_str
      const localdates = item.data.map(x => x.date_created_str)

      // Find the forecast_dates[] and months[] difference
      const extraMonths = item.months.filter(x => !localmonths.includes(x))
      const extraDates = item.forecast_dates.filter(x => !localdates.includes(x))

      logMessage(`Found ${extraMonths.length} extra months in doc ${item.id}`)
      logMessage(`Found ${extraDates.length} extra forecast_dates in doc ${item.id}`)

      // Delete diffs from main doc
      item.months = item.months.filter(month => !extraMonths.includes(month))
      item.forecast_dates = item.forecast_dates.filter(date => !extraDates.includes(date))
    })

    // Update or delete documents
    const batch = db.batch()

    withOldData.forEach(item => {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
        .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
        .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)
        .doc(item.id)

      if (item.data.length === 0) {
        // Delete the main doc
        batch.delete(docRef)
      } else {
        // Update the main doc
        batch.update(docRef, {
          data: item.data,
          months: item.months,
          forecast_dates: item.forecast_dates
        })
      }
    })

    await batch.commit()
    logMessage(`Finished cleaning the archived special weather documents on ${logDateNow()}`)
  } catch (err) {
    logMessage(`[CLEAN-CYCLONE]: ${err.message}`)
  }
}

/**
  * Append a prefix to console.log messages
  * @param {String} message - log message
  */
const logMessage = (message) => {
  console.log(`[CLEAN-CYCLONE]: ${message}`)
}

/**
 * Generates Latest string date in "YYYY/MM/DD" format with hh:mm:ss
 * @returns {String} Detailed latest date string
 */
const logDateNow = () => {
  return dayjsUTC(new Date()).tz('Singapore').format('ddd YYYY/MM/DD hh:mm:ss A')
}

// cleanSpecialArchives()
module.exports = cleanSpecialArchives
