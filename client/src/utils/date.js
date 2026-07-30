import { CROP_STAGES_MONTH, MONTH_LABELS } from '@/utils/constants'

const DAY_FORMAT_OPTIONS = { hour: '2-digit', minute: '2-digit' }

/**
 * Get the current Date in String format
 * @param {Bool} withYear - Remove year in the returned data
 * @returns {String} JavaScript Date in String format
 */
const getNowDateString = (withYear = true) => {
  // TO-DO: Fetch date from server
  let dateNow = new Date().toDateString()

  return (withYear)
    ? dateNow
    : dateNow.substring(0, dateNow.length - 5)
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
  const mcode = Object.values(MONTH_LABELS).find(mo => mo.num === month).code
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

      // TO-DO: Check if next month returns a string instead of array
      const eMcode = Object.values(MONTH_LABELS).find(mo => mo.num === (nextMonthIndex)).code
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
 * Returns a Firestore Date with time in a simple String
 * @param {Firestore Date} firestoreTimeStamp - Firestore timestamp { seconds, nanoseconds }
 * @returns {String} String-converted Firestore Date with Time
 */
const getFirestoreDateTimeString = (firestoreTimeStamp = {}) => {
  if (!Object.keys(firestoreTimeStamp).includes('seconds')) {
    return '-'
  } else {
    const currentDate = firestoreTimeStamp.toDate()
    return `${currentDate.toDateString()} ${currentDate.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
  }
}

/**
 * Converts a regular Javascript timestamp to a simple Date String
 * @param {Date} timestamp - Javascript Date timestamp { _seconds, _nanoseconds }
 * @returns {String} String-converted Javascript Date with Time
 */
const getTimestampDateTimeString = (timestamp = {}) => {
  if (!Object.keys(timestamp).includes('_seconds')) {
    return '-'
  } else {
    const currentDate = new Date(timestamp._seconds * 1000)
    return `${currentDate.toDateString()} ${currentDate.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
  }
}

/**
 * Generate a full JavaScript date of a selected date from a 10-day weather forecast, or any start and end date.
 * @param {String} dateSelected - Formatted date string from a 10-day weather forecast date range i.e., "Sat Nov 19"
 * @param {String} endDate - Formatted end date string of a 10-day weather forecast date range i.e., "Sat Nov 19"
 * @returns {Date} Full JavaScript date of "dateSelected" with appropriate year
 */
const getFullDateForSelectedTendayDate = (dateSelected, endDate) => {
  let sDate = new Date(`${dateSelected}, ${new Date().getFullYear()}`)
  let eDate = new Date(`${endDate}, ${new Date().getFullYear()}`)

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

export {
  getNowDateString,
  getMaxDaysInMonth,
  getRangedMonths,
  getFirestoreDateTimeString,
  getTimestampDateTimeString,
  isDateValid,
  getFullDateForSelectedTendayDate,
  DAY_FORMAT_OPTIONS
}
