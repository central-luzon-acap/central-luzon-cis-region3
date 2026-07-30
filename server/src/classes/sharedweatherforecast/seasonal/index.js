const SharedSeasonalWeatherForecast = require('./seasonal')

const SS = new SharedSeasonalWeatherForecast()

/**
  * Archives the current "active" seasonal weather forecast data.
  * Store and archive a set of (6) six seasonal months weather forecast data.
  * @typedef {Object} params
  * @param {String} region - Region name
  * @param {String} province - Province name
  */
const archiveseasonalforecast = SS.archiveseasonalforecast.bind(SS)

/**
  * Format the seasonal weather forecast data for sharing with 3rd party collaborators.
  * @param {Object} seasonalData - Seasonal weather forecast data.
  * @param {Bool} showArchivedTs - Include Firebase timestamps in the response object.
  * @returns
  */
const formatSeasonalForecast = SS.formatSeasonalForecast.bind(SS)

/**
  * Returns an archived (formatted) seasonal weather forecast data
  * @typedef {Object} params
  * @param {String} id - Unique document ID
  * @param {String} province - Province name
  * @param {String} month_start - Month code of the (6) six seasonal month's 1st (starting) month
  * @param {String} year - Year
  * @returns {Object} Archived seasonal weather forecast document
  */
const getArchivedSeasonalForecast = SS.getArchivedSeasonalForecast.bind(SS)

/**
  * Returns the archived seasonal forecasts of a specified month and year, as recorded in the past (5) months and target month (1).
  * Returns a max total of (6) months containing only the target month's seasonal data. Non-existent months are omitted from the results.
  * @typedef {Object} params
  * @param {String} province - Province name
  * @param {String} month - Month code
  * @param {Number} year - Year
  * @returns {Object}
  */
const getArchivedSeasonalForecastFull = SS.getArchivedSeasonalForecastFull.bind(SS)

/**
 * Fetch a seasonal weather forecast by province.
 */
const getforecast = SS.getforecast.bind(SS)

module.exports = {
  archiveseasonalforecast,
  formatSeasonalForecast,
  getArchivedSeasonalForecast,
  getArchivedSeasonalForecastFull,
  getforecast
}
