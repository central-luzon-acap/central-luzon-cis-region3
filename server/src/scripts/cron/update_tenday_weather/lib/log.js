const {
  createLogItem,
  createLogDoc,
  deleteLogById,
  LOG_OBJECTS,
  LOG_CATEGORIES,
  LOG_LEVELS
} = require('../../../../classes/errorlog')

const {
  upsertsharedforecast_tenday,
  DATA_TYPE
} = require('../../../../classes/sharedweatherforecast/tenday')
const { PROVINCES } = require('./constants')

/**
 * Creates an ErrorLogItem inside a logs[] array under the current date-named "YYYY-MM-DD" document.
 * @param {String} message - Error message
 * @returns {Promise}
 */
const logError = async (message) => {
  if (process.env.IS_RMCAS_API_ACTIVE !== '1') return

  return await createLogItem({
    type: LOG_OBJECTS.CRON,
    category: LOG_CATEGORIES[LOG_OBJECTS.CRON].TENDAY,
    errLevel: LOG_LEVELS.ERROR,
    message
  })
}

/**
 * Creates an ErrorLogDoc document.
 * @param {String} message - Error message
 * @returns {Promise}
 */
const logErrorDoc = async (message) => {
  if (process.env.IS_RMCAS_API_ACTIVE !== '1') return

  return await createLogDoc({
    type: LOG_OBJECTS.CRON,
    category: LOG_CATEGORIES[LOG_OBJECTS.CRON].TENDAY,
    errLevel: LOG_LEVELS.ERROR,
    message
  })
}

/**
 * Deletes an ErrorLog document by ID (document name)
 * @param {String} dateYesterday - Date string in "YYYY-MM-DD" format
 * @returns {Promise}
 */
const deleteErrorDoc = async (dateYesterday) => {
  if (process.env.IS_RMCAS_API_ACTIVE !== '1') return

  return await deleteLogById({
    type: LOG_OBJECTS.CRON,
    category: LOG_CATEGORIES[LOG_OBJECTS.CRON].TENDAY,
    docId: dateYesterday
  })
}

/**
 * Creates a "regular" or "error" shared 10-day weather forecast document
 * @typedef {Object} params
 * @param {String} region - Region name
 * @param {String} type - Shared 10-day weather forecast document type
 * @returns
 */
const createSharedForecast = async ({ region, type }) => {
  if (process.env.IS_RMCAS_API_ACTIVE !== '1') return

  const provinces = PROVINCES[region]
  const queryUpload = []

  console.log(`[PROCESS]: Creating a "${type}" type SharedTendayWeatherForecast document.`)

  provinces.forEach((province) => {
    queryUpload.push(upsertsharedforecast_tenday({
      region,
      province,
      type,
      showDateCreatedTS: true
    }))
  })

  return await Promise.all(queryUpload)
}

module.exports = {
  logError,
  logErrorDoc,
  deleteErrorDoc,
  createSharedForecast,
  DATA_TYPE
}
