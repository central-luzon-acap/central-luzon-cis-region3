const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const WEATHER_TYPES = {
  TENDAY: 'tenday',
  SEASONAL: 'seasonal',
  SPECIAL: 'special'
}

const MAX_DATES = 93

/**
 * Checks if a string date follows the "YYYY/MM/DD" format
 * @param {String} dateStr - Date in "YYYY/MM/DD" string format.
 * @returns
 */
const isValidDate = (dateStr) => {
  return dayjs(dateStr, 'YYYY/MM/DD', true).isValid()
}

/**
 *  Checks if a year input has exactly 4 digits
 * @param {String|Number} year - Year
 * @returns
 */
const isValidYear = (year) => {
  return /^\d{4}$/g.test(year)
}

module.exports = {
  WEATHER_TYPES,
  MAX_DATES,
  isValidDate,
  isValidYear
}
