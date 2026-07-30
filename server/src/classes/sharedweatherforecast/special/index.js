const SharedSeasonalWeatherForecast = require('./special')

const SWF = new SharedSeasonalWeatherForecast()

/**
  * Archives the current "active" special weather forecast data with a typhoon signal.
  * This script should run before overwriting the active data set with newly web-scraped cyclone data.
  * @returns
  */
const archiveSpecialWeatherForecast = SWF.archiveSpecialWeatherForecast.bind(SWF)

/**
  * Returns a set of archived (formatted) special (severe cylone/typhoon) weather forecast data
  * @typedef {Object} params
  * @param {String} params.id - Unique document ID
  * @param {String} params.year - Year
  * @param {String} params.month - Month code
  * @param {String} params.typhoonName - Typhoon name
  * @param {String} params.date - Date the special weather forecast was saved to database in "YYYY/MM/DD" format.
  * @returns {Object} Archived seasonal weather forecast document
  */
const getArchivedSpecialForecast = SWF.getArchivedSpecialForecast.bind(SWF)

/**
  * Fetches the archived special weather data by the "forcast_dates[]" field.
  * Returns transformed and filtered results to include only the specified "data[]" items with the specified "date" in the "date_created_str" field.
  * @param {String} date - Date in "YYYY/MM/DD" string format.
  * @returns {Object[]} Firestore documents
  */
const queryGetSpecialArchivesByDate = SWF.queryGetSpecialArchivesByDate.bind(SWF)

const queryGetSpecialArchivesByMonthYear = SWF.queryGetSpecialArchivesByMonthYear.bind(SWF)

/**
 * Fetch the latest special weather forecast data.
 */
const getcycloneinformation = SWF.getcycloneinformation.bind(SWF)

/**
  * Updates the affected municipalities data of an archived typhoon bulletin sub-item by its "bulletin_no" from a specific "year" and "typhoon_name" document.
  * @param {Object[]} affectedData - Object[] list of typhoon-affected municipalities
  * @returns {Promise}
  */
const archiveAffectedMunicipalities = SWF.archiveAffectedMunicipalities.bind(SWF)

/**
  * Find the unique identifiers of a special weather forecast data
  * @typedef {Object} meta
  * @param {String} meta.typhoon_name Full, - unprocessed typhoon name
  * @param {String} meta.bulletin_number - Text containing the bulletin number
  * @returns {Object}
  *  - bulletinNo: {Number} - Bulletin number
  *  - classification: {String} -Typhoon classification type
  *  - typhoonName: {String} - Just the typhoon name
  *  - yearNow: {Number} - The current year
  */
const findUniquIdentifiers = SWF.findUniquIdentifiers.bind(SWF)

/**
  * Checks if an archived special weather forcast exists by fetching its typhoon_name and year.
  * Also returns the fetched document if it exists.
  * This expects to return only (1) one document in an Object[]. Check for bugs if this returns more than (1) document.
  * @param {String} year - Year
  * @param {String} typhoonName - Typhoon name
  * @returns {Object} Firestore document array
  */
const isExistArchivedDocument = SWF.isExistArchivedDocument.bind(SWF)

module.exports = {
  archiveAffectedMunicipalities,
  archiveSpecialWeatherForecast,
  getArchivedSpecialForecast,
  queryGetSpecialArchivesByDate,
  queryGetSpecialArchivesByMonthYear,
  getcycloneinformation,
  findUniquIdentifiers,
  isExistArchivedDocument
}
