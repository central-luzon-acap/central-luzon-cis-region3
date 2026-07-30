const {
  archivetendayforecast,
  getsharedtendayforecast
} = require('../../../../classes/sharedweatherforecast/tenday')

const isTendayArchiveExists = require('./check')
const { REGION, PROVINCE_LIST_ARCHIVE } = require('../../../../utils/constants')

/**
 * Downloads, formats and archives the latest 10-day weather forecast data
 * if the "date_created_str" field of each province does not yet exist as a Document in the
 * FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES (province) collection
 * @returns {Promise}
 */
const archiveForecast = async () => {
  try {
    const forecastData = []
    const archiveQueries = []

    // Download the latest "shared" province 10-day weather forecast data
    for (let i = 0; i < PROVINCE_LIST_ARCHIVE.length; i += 1) {
      forecastData.push(getsharedtendayforecast({
        region: REGION,
        province: PROVINCE_LIST_ARCHIVE[i],
        showDateCreatedTS: true, // Include the ts_date_created key in the archives
        minimalError: false
      }))
    }

    console.log(`[INFO]: Fetching the current 10-day weather forecast data for the provinces: ${PROVINCE_LIST_ARCHIVE.toString()}`)
    const response = await Promise.all(forecastData)

    // Batch-check if the latest 10-day weather forecast for all provinces does not exist in the archived data collection
    const { message } = await isTendayArchiveExists(response.map(item => ({
      province: item.province,
      date_created_str: item.date_created_str
    })))

    console.log(`[INFO]: The current active "shared" ten-day forecast's actual "date_created" date is: [${response[0].date_created_str}]`)
    console.log(`[INFO]: ${message}`)
    console.log(`[INFO]: Archiving the current active "shared" ten-day weather forecast for date ${response[0].date_created_str}, ID: ${response[0].id}...\n`)

    // Archive the requested 10-day weather forecast record
    response.forEach(record => {
      archiveQueries.push(archivetendayforecast(record.province, record, true))
    })

    return await Promise.all(archiveQueries)
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = archiveForecast
