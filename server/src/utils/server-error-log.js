const { dayjsUTC } = require('./dayjs_utc')

/**
 * Logs the error message from the Express default error-handling middleware
 * @typedef {Object} params - Input parameters
 * @param {Object} user - Firebase Auth user object
 * @param {String} error - Error message
 * @param {String} origin - Domain name of the originating request
 * @param {String} route - App route
 * @returns {Object} Error data {Object}
 *  - date: {String} Formatted date of error occurrence in Singapore timezone
 *  - origin: {String} Domain name of the originating request
 *  - route: {String} Express app route
 *  - error: {String} Error message
 */
const logServerErrorInfo = ({ error, user, origin = 'n/a', route = 'n/a' }) => {
  const timeZone = 'Singapore'
  const dateNow = dayjsUTC(new Date()).tz(timeZone).format('ddd YYYY/MM/DD hh:mm:ss A')
  const errMsg = error?.message ?? { message: '-' }

  // Build JSON error object
  const errorData = {
    date: dateNow,
    origin,
    route,
    user: null,
    error: errMsg
  }

  // Display user information
  if (user) {
    errorData.user = {
      uid: user?.uid ?? '[no uid]',
      email: user?.email ?? '[no email]'
    }
  }

  console.log(`\n[SERVER-ERROR]: Date ${dateNow} (${timeZone} timezone)\n`, errorData)
  return errorData
}

module.exports = {
  logServerErrorInfo
}
