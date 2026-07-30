const dayjs = require('dayjs')
const { WEATHER_TYPES, MAX_DATES, isValidDate } = require('./constants')
const { groupByTens } = require('../../utils/helpers')

/**
 * Validates the date URL parameters for the historical "10-day" weather forecast endpoint.
 * Requires to be called "1st" in the middleware chain (1. tenday, 2. seasonal, 3. special)
 */
module.exports.validHistoricalForecastTenday = async (req, res, next) => {
  const {
    id,
    type,
    province,
    date_created: dateCreated,
    date_created_range: dateCreatedRange
  } = req.query

  let dateCreatedStrings = []

  if (!type || !province) {
    return res.status(500).send('Missing parameters')
  }

  // Validate weather type
  if (!Object.values(WEATHER_TYPES).includes(type)) {
    return res.status(500).send('Unsupported weather type')
  }

  // Move to the next middleware
  if (type !== WEATHER_TYPES.TENDAY) {
    return next()
  }

  if (!id) {
    if (dateCreated && dateCreatedRange) {
      return res.status(500).send('Define only one of date_created or date_created_range parameters.')
    }

    if ([dateCreated, dateCreatedRange].filter(item => item === undefined).length === 2) {
      return res.status(500).send('Missing URL parameters.')
    }

    // Validate the date_created param
    if (dateCreated) {
      dateCreatedStrings = dateCreated.split(',')

      if (dateCreatedStrings.length >= MAX_DATES) {
        return res.status(500).send(`Total dates are greater than ${MAX_DATES} days.`)
      }

      let invalidDate = false

      for (let i = 0; i < dateCreatedStrings.length; i += 1) {
        if (!isValidDate(dateCreatedStrings[i])) {
          invalidDate = true
          break
        }
      }

      if (invalidDate) {
        return res.status(500).send('Invalid date format.')
      }

      req.query.date_created = groupByTens(dateCreated.split(','))
    }

    // Validate the date_created_range param
    if (dateCreatedRange) {
      const dateCreatedRangeStr = dateCreatedRange.split(',')

      if (dateCreatedRangeStr.length > 2 || dateCreatedRangeStr === 0) {
        return res.status(500).send('Invalid date range.')
      }

      // Check if the start and end date created dates are valid
      let invalidDate = false

      for (let i = 0; i < dateCreatedRangeStr.length; i += 1) {
        if (!isValidDate(dateCreatedRangeStr[i])) {
          invalidDate = true
          break
        }
      }

      if (invalidDate) {
        return res.status(500).send('Invalid date format.')
      }

      // Check dates: Start date cannot come after the end date.
      if (dayjs(dateCreatedRangeStr[0]).isAfter(dayjs(dateCreatedRangeStr[1]))) {
        return res.status(500).send('Start date is higher than the end date.')
      }

      // Check dates: Total days in the date range cannot exceed MAX_DATES days.
      const diff = dayjs(dateCreatedRangeStr[1]).diff(dateCreatedRangeStr[0], 'day')

      if (diff > MAX_DATES) {
        return res.status(500).send(`Requested date created range cannot exceed ${MAX_DATES} days.`)
      }

      // Check dates: The "end" date range cannot be ahead of yesterday's date
      if (dayjs(dateCreatedRangeStr[1]).isAfter(dayjs(new Date()))) {
        return res.status(500).send('Data for the end date does not yet exist.')
      }

      req.query.date_created_range = dateCreatedRangeStr
    }
  } else {
    if (dateCreated || dateCreatedRange) {
      return res.status(500).send('Define only one of date_created, date_created_range or id URL parameters.')
    }
  }

  next()
}
