const {
  MONTHS,
  CROP_STAGES_MONTH
} = require('./constants')

/**
 * Get the current Date in String format
 * @param {Bool} withYear - Remove year in the returned data
 * @returns {String} JavaScript Date in String format
 */
const getNowDateString = (withYear = true) => {
  // TO-DO: Fetch date from server
  const dateNow = new Date().toDateString()

  return (withYear)
    ? dateNow
    : dateNow.substring(0, dateNow.length - 5)
}

/**
  * Removes the day name (i.e., Sun, Mon, Tue) from a formatted date string
  * @param {String} formattedDate - Formatted date string following the format "Sun Dec 31"
  * @returns {String} - Formatted date minus the day name i.e., "Dec 31", "Jan 01""
  */
const removeDayString = (formattedDate) => {
  return formattedDate.substring(4, formattedDate.length)
}

/**
   * Get the maximum no. of days in a month
   * @param {String} year - Year
   * @param {Number} month JavaScript Month (0-11)
   * @returns {Number} Maximum days in a month
   */
const getMaxDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Find the inclusive months in a 10-Day date range with crop stage information
 * for the 1st and 2nd half of month
 * @param {Date} date
 * @param {Bool} getEnd - Include the end date data
 * @returns {Object} { <month_code>: ['1st_half', '2nd_half'] }
 */
const getRangedMonths = (date, getEnd = true) => {
  const month = date.getMonth()
  const mcode = Object.keys(MONTHS)[month]
  const sDay = date.getDate()
  const maxDays = getMaxDaysInMonth(date.getFullYear(), month)
  const middleDate = Math.floor(maxDays / 2)

  // Starting month
  const startPart = (sDay > middleDate)
    ? CROP_STAGES_MONTH.SECOND_HALF
    : CROP_STAGES_MONTH.FIRST_HALF

  const inclusiveMonths = {
    [mcode]: [startPart]
  }

  if (getEnd) {
    // End month of the 10-Day date range
    const enDate = sDay + 10 - 1

    // End date falls on next month
    if (enDate > maxDays) {
      const nextMonthIndex = (month + 1) === 12
        ? 0 // back to January
        : (month + 1)

      const eMcode = Object.keys(MONTHS)[nextMonthIndex]
      inclusiveMonths[eMcode] = [CROP_STAGES_MONTH.FIRST_HALF]
    }

    // End date falls within the 2nd half of the current month
    if (enDate <= maxDays && enDate > middleDate) {
      inclusiveMonths[mcode].push(CROP_STAGES_MONTH.SECOND_HALF)
    }
  }

  return inclusiveMonths
}

/**
 * Check if an input parameter is a valid Date
 * @param {String|Date|Number} date
 * @returns {Bool}
 */
const isDateValid = (date) => {
  const testDate = new Date(date)
  return testDate instanceof Date && !isNaN(testDate.valueOf())
}

/**
 * Generate at full JavaScript date of a selected date from a 10-day weather forecast, or any start and end date.
 * @param {String} dateSelected - Formatted date string from a 10-day weather forecast date range i.e., "Sat Nov 19"
 * @param {String} endDate - Formatted end date string of a 10-day weather forecast date range i.e., "Sat Nov 19"
 * @returns {Date} Full JavaScript date of "dateSelected" with appropriate year
 */
const getFullDateForSelectedTendayDate = (dateSelected, endDate) => {
  let sDate = new Date(`${dateSelected}, ${new Date().getFullYear()}`)
  const eDate = new Date(`${endDate}, ${new Date().getFullYear()}`)

  // Start date falls on December and end date falls in January
  if (sDate.getMonth() + 1 === 12 && eDate.getMonth() + 1 === 1) {
    const nowDate = new Date()

    // Current month is January
    if (nowDate.getMonth() === eDate.getMonth()) {
      sDate = new Date(`${dateSelected}, ${nowDate.getFullYear() - 1}`)
    }
  }

  return sDate
}

module.exports = {
  getNowDateString,
  getMaxDaysInMonth,
  getRangedMonths,
  isDateValid,
  removeDayString,
  getFullDateForSelectedTendayDate
}
