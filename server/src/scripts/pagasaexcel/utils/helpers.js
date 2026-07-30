const { MONTHS } = require('./constants')

/**
 * Checks if an array of numbers corresponding to month indices are arranged in a valid order
 * @param {Number[]} array - Array of numbers corresponding to a month's 0-based index i.e., 0=jan, 1=feb, 2=mar
 * @returns {Bool} (6) months numeric indices are arranged in an ascending order sequence
 */
const isValidMonthSequence = (array) => {
  // TO-DO: Do server-side months sequence validation
  const mos = array.map(x => x + 1)
  let valid = true
  let count = 0

  while (count < mos.length - 1) {
    if (Math.abs(mos[count + 1] - mos[count]) !== 1 || mos[count + 1] < mos[count]) {
      valid = false

      if (mos[count] === 12 && mos[count + 1] === 1) {
        valid = true
      }

      if (!valid) {
        break
      }
    }
    count += 1
  }

  return valid
}

/**
  * Arrange (6) months in ascending order from an Array of assorted month name strings
  * @param {String[]} monthlist - List of full month names
  * @param {number} maxMonths - Total number of months to arrange
  * @param {Bool} isAbbrev - Months in monthsList[] are written in abbreviation i.e., 'Jan', 'Jul', 'Aug', ...
  * @returns {String[]} - List of full month names in ascending order
  */
const arrangeMonths = (monthlist, maxMonths, isAbbrev = false) => {
  const key = (isAbbrev) ? 'abbrev' : 'full'
  const months = MONTHS.filter(month => monthlist.includes(month[key].toLowerCase()))

  if (months.length !== maxMonths) {
    throw new Error('Invalid number of months')
  }

  const ids = months.map(month => month.id)
  const specialMonth = ids.find(index => index >= 7)
  const start = (specialMonth)
    ? ids.indexOf(specialMonth)
    : 0

  let index = start
  const mos = []

  while (mos.length < maxMonths) {
    mos.push(months.find(month => month.id === ids[index]))

    index = (index + 1 < maxMonths)
      ? index + 1
      : 0
  }

  if (!isValidMonthSequence(mos.map(mo => mo.id))) {
    throw new Error('Invalid months sequence')
  }

  return mos.map(mo => mo.full)
}

/**
  * Checks if an Array (maxMonths items) of assorted month name strings in lowercase (in any order) are arranged in an ascending order
  * @param {String[]} monthlist - List of full month names
  * @param {number} maxMonths - Total number of months to arrange
  * @param {Bool} isAbbrev - Months in monthsList[] are written in abbreviation i.e., 'Jan', 'Jul', 'Aug', ...
  * @returns {String[]} - List of full month names in ascending order
  */
const validateMonthsSequence = (monthlist, maxMonths, isAbbrev = false) => {
  const key = (isAbbrev) ? 'abbrev' : 'full'

  // Get MONTHS details in ascending order
  // const months = MONTHS.filter(month => monthlist.includes(month[key].toLowerCase()))

  // Get MONTHS details using the input months ordering
  const months = monthlist.reduce((list, monthToFind) => {
    const mo = MONTHS.find(month => month[key].toLowerCase() === monthToFind)

    if (mo) {
      return [...list, mo]
    } else {
      throw new Error(`Invalid month name - ${monthToFind}`)
    }
  }, [])

  if (months.length !== maxMonths) {
    throw new Error('Invalid number of months')
  }

  if (!isValidMonthSequence(months.map(mo => mo.id))) {
    throw new Error('Invalid months sequence')
  }

  return months.map(mo => mo.full)
}

/**
  * Check if a value is a Number
  * @param {String|Number} value - String or Number value
  * @returns {Bool}
  */
const isNumber = (value) => {
  return !isNaN(value)
}

/**
  * Check if a value is a String
  * @param {String} value - String value
  * @returns {Bool}
  */
const isString = (value) => {
  return typeof value === typeof 'sample string'
}

/**
 * Check if a string is a valid full or abbreviated month name
 * @param {String} month - full or abbreviate month name
 * @param {Bool} isAbbrev - month is abbreviation i.e., 'Jan', 'Jul', 'Aug', ...
 */
const isMonth = (month, isAbbrev = false) => {
  const key = (isAbbrev) ? 'abbrev' : 'full'
  return MONTHS.map(month => month[key].toLowerCase())
    .includes(month.toLowerCase())
}

module.exports = {
  isValidMonthSequence,
  validateMonthsSequence,
  arrangeMonths,
  isNumber,
  isMonth,
  isString
}
