const { dayjsUTC } = require('../../../../utils/dayjs_utc')

/**
 * Finds the unit number of difference between a given date and the current date (now).
 * https://day.js.org/docs/en/display/difference
 * @param {Date} dateString - Date in "YYYY-MM-DD" string format
 * @param {String} unit - DayJS unit of measure
 * @returns {Number}
 */
const diff = (dateString, unit = 'month') => {
  try {
    const dayNowStr = dayjsUTC().tz('Singapore').format('YYYY-MM-DD')
    const dayNow = dayjsUTC(dayNowStr)

    return dayNow.diff(dateString, unit)
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = diff
