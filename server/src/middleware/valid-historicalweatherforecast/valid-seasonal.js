const { WEATHER_TYPES, isValidYear } = require('./constants')
const { MONTHS } = require('../../utils/constants')

/**
 * Validates query parameters for the historical "seasonal" weather forecast endpoint.
 * Requires to be called "2nd" in the middleware chain (1. tenday, 2. seasonal, 3. special)
 */
module.exports.validHistoricalForecastSeasonal = async (req, res, next) => {
  try {
    const {
      id,
      type,
      province,
      month_start,
      year,
      month
    } = req.query

    if (!type || !province) {
      return res.status(500).send('Missing parameters')
    }

    // Validate weather type
    if (!Object.values(WEATHER_TYPES).includes(type)) {
      return res.status(500).send('Unsupported weather type')
    }

    // Move to the next middleware
    if (type !== WEATHER_TYPES.SEASONAL) {
      return next()
    }

    if (!id) {
      if (month && month_start) {
        return res.status(500).send('Define only one of month or month_start parameters.')
      }

      if ([month_start, year].filter(item => item === undefined).length === 2) {
        return res.status(500).send('Missing URL parameters.')
      }

      // Validate the year param
      if (!isValidYear(year)) {
        return res.status(500).send('Invalid year')
      }

      // Validate the month_start param
      if (month_start) {
        if (!Object.keys(MONTHS).includes(month_start)) {
          return res.status(500).send('Invalid month format')
        }
      }

      if (month) {
        if (!Object.keys(MONTHS).includes(month)) {
          return res.status(500).send('Invalid month format')
        }
      }
    } else {
      if (!month_start || !year) {
        return res.status(500).send('Define one of month_start or year')
      }
    }

    next()
  } catch (err) {
    return next(new Error(err.message))
  }
}
