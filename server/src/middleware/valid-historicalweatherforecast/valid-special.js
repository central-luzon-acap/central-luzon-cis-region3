const { WEATHER_TYPES, isValidYear, isValidDate } = require('./constants')
const { MONTHS } = require('../../utils/constants')

/**
 * Validates query parameters for the historical "special (severe cyclone)" weather forecast endpoint.
 * Requires to be called "3rd" (last) in the middleware chain (1. tenday, 2. seasonal, 3. special)
 */
module.exports.validHistoricalForecastSpecial = async (req, res, next) => {
  try {
    const {
      type,
      province,
      year,
      month,
      date
    } = req.query

    if (!type || !province) {
      return res.status(500).send('Missing parameters')
    }

    // Validate weather type
    if (!Object.values(WEATHER_TYPES).includes(type)) {
      return res.status(500).send('Unsupported weather type')
    }

    // Move to the next middleware
    if (type !== WEATHER_TYPES.SPECIAL) {
      return next()
    }

    if (!date) {
      if ([year, month].filter(item => item === undefined).length === 2) {
        return res.status(500).send('Missing URL parameters.')
      }

      if (!year || !month) {
        return res.status(500).send('Missing year or month parameters.')
      }

      // Validate the year param
      if (!isValidYear(year)) {
        return res.status(500).send('Invalid year')
      }

      // Validate the month_start param
      if (month) {
        if (!Object.keys(MONTHS).includes(month)) {
          return res.status(500).send('Invalid month format')
        }
      }
    } else {
      // Validate date
      if (!isValidDate(date)) {
        return res.status(500).send('Invalid date format')
      }

      if (year || month) {
        return res.status(500).send('The year or month param should not be used with date')
      }
    }

    next()
  } catch (err) {
    return next(new Error(err.message))
  }
}
