const {
  SharedTendayWeatherForecast,
  DATA_TYPE
} = require('./tenday')

const ST = new SharedTendayWeatherForecast()

/**
 * Formats ACAP's 10-day weather forecast data for sharing with 3rd party collaborators
 * @param {String} province - Province name
 * @param {Object} tendayData - Original 10-day weather forecast data retrieved from "TendayForecast.getforecast"
 * @param {Bool} showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
 * @returns {Object} Formatted 10-day weather forecast data
 */
const formattendayforecast = ST.formattendayforecast.bind(ST)

/**
  * Formats an error response to ACAP's 10-day weather forecast data for sharing with 3rd party collaborators
  * @typedef {Object} params - Input parameters
  * @param {String} params.region - Region name
  * @param {String} params.province - Province name
  * @param {Object} params.errorLog - 10-day weather forecast error log information. Error logging depends on the day and time of calling the cron:tenday script.
  * @param {Bool} params.showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
  * @returns {Object} Formatted 10-day weather forecast data
  */
const formattendayforecasterror = ST.formattendayforecasterror.bind(ST)

/**
  * Returns a the 10-day weather forecast data of a province for sharing with the weather forecast API.
  * This returns a static copy of a 10-day weather forecast data or an ErrorLog document.
  * @typedef {Object} params
  * @param {String} region - Region name
  * @param {String} province - Province name
  * @param {Bool} showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
  * @param {Bool} minimalError - Flag to remove the misc fields of the error response object. Defaults to "false".
  * @returns {Object} Formatted 10-day weather forecast data for a province
  */
const getsharedtendayforecast = ST.getsharedtendayforecast.bind(ST)

/**
  * Returns the latest formatted 10-day weather forecast data for a province.
  * Returns an error information if there cron:scrape errors for the current day or the "errorDateStr" day of accessing this function.
  * @typedef {Object} params
  * @param {String} params.region - Region name
  * @param {String} params.province - Province name
  * @param {String} params.errorDateStr - (Optional) Error log date in "YYYY-MM-DD" string format. If omitted, this function uses the error log date for the current date.
  * @param {Bool} params.showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
  * @param {Bool} params.forArchives - Flag to include all data in the "logs[]" array of an ErrorLog object.
  * @returns {Object} Formatted 10-day weather forecast data for a province
  */
const getlatesttendayforecast = ST.getlatesttendayforecast.bind(ST)

/**
  * Returns a province's archived formatted 10-day weather forecast data by the "date_created_str" field.
  * @param {String} province - Province name
  * @param {String} dateCreatedStr - Date the archived 10-day weather forecast was uploaded to DB ("date_created_str") in YYYY/MM/DD format.
  * @returns {Object[]} Firestore documents
  */
const getarchivedtendayforecast = ST.getarchivedtendayforecast.bind(ST)

/**
  * Store and archive a set of 10-day weather forecast data.
  * @param {String} province - Province name
  * @param {Object} data - 10-day weather forecast data (including all municipalities) for a "date_created" date
  * @param {Bool} overwriteExisting
  *    - Allow overwriting an existing "YYYY-MM-DD" Document with new data. Defaults to "true".
  *    - If "false", throw an Error if an existing "YYYY-MM-DD" is found.
  * @returns {Promise}
  */
const archivetendayforecast = ST.archivetendayforecast.bind(ST)

/**
  * Checks if an archived 10-day weather forcast data with the given "date_created_str" param exists
  * @param {String} province - Province name
  * @param {String} dateCreatedStr - Date the archived 10-day weather forecast data was created in "YYYY/MM/DD" string format
  * @returns {Bool} true|false
  */
const isExistArchive = ST.isExistArchive.bind(ST)

/**
  * Creates the 10-day weather forecast data for sharing in the shared API - a formatted 10-day weather forecast data or an error object.
  * in the /weather_forecasts_api/{province}/{docId} document.
  * Assumes ErrorLogItem.createLog() is run prior to calling this function if params.type=DATA_TYPE.ERROR
  * @typedef {Object} params
  * @param {String} params.region - Region name
  * @param {String} params.province - Province name
  * @param {Bool} params.showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
  * @param {String} params.type - 10-day weather forecast document type
  *  - type=DATA_TYPE.REGULAR: Stores the latest (legit) stored 10-day weather forecast data in the 10-day forecast sharing API.
  *  - type=DATA_TYPE.ERROR: Assumes ErrorLogItem.createLog() is run prior to calling this function. Stores the latest "ErrorLogItem" in the 10-day forecast sharing API.
  */
const upsertsharedforecast_tenday = ST.upsertsharedforecast_tenday.bind(ST)

module.exports = {
  archivetendayforecast,
  formattendayforecast,
  formattendayforecasterror,
  getsharedtendayforecast,
  getlatesttendayforecast,
  getarchivedtendayforecast,
  isExistArchive,
  upsertsharedforecast_tenday,
  DATA_TYPE
}
