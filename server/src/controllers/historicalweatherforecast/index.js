
const { getarchivedtendayforecast } = require('../../classes/sharedweatherforecast/tenday')
const { getArchivedSeasonalForecast, getArchivedSeasonalForecastFull } = require('../../classes/sharedweatherforecast/seasonal')
const { queryGetSpecialArchivesByDate, queryGetSpecialArchivesByMonthYear } = require('../../classes/sharedweatherforecast/special')
const { WEATHER_TYPES } = require('../../middleware/valid-historicalweatherforecast/constants')

module.exports.historicalWeatherForecast = async (req, res, next) => {
  // Common historical forecast parameters
  const {
    type,
    id,
    province
  } = req.query

  // 10-day forecast parameters
  const {
    date_created: dateCreatedByTenArray,
    date_created_range: dateCreatedRange
  } = req.query

  // Seasonal forecast parameters
  const {
    month_start,
    month,
    year
  } = req.query

  // Special (severe cyclone) weather forecast parameters
  const {
    date
  } = req.query

  switch (type) {
    case WEATHER_TYPES.TENDAY:
      try {
        let data = []

        // Query by selected date_created array
        if (dateCreatedByTenArray) {
          const fetchQueries = []

          dateCreatedByTenArray.forEach((dateCreatedGroup) => {
            fetchQueries.push(getarchivedtendayforecast({
              province,
              dateCreatedStr: dateCreatedGroup
            }))
          })

          data = (await Promise.all(fetchQueries)).flat()
        }

        // Query by date range
        if (dateCreatedRange) {
          data = await getarchivedtendayforecast({
            province,
            dateCreatedRange
          })
        }

        // Query by document ID
        if (id) {
          data = await getarchivedtendayforecast({
            province,
            id
          })
        }

        if (data.length === 0) {
          return res.status(404).send(`Selected data for ${province} does not exist.`)
        } else {
          return res.status(200).send(data)
        }
      } catch (err) {
        return next(new Error(err))
      }
    case WEATHER_TYPES.SEASONAL:
      try {
        if (month) {
          // Find all months that includes the target month
          const data = await getArchivedSeasonalForecastFull({ province, month, year })

          if (data.length === 0) {
            return res.status(404).send(`Selected data for ${province} does not exist.`)
          } else {
            return res.status(200).send(data)
          }
        } else {
          // Find (6) seasonal months starting from a month
          const data = await getArchivedSeasonalForecast({ id, province, month_start, year })

          if (data.length === 0) {
            return res.status(404).send(`Selected data for ${province} does not exist.`)
          } else {
            return res.status(200).send(data)
          }
        }
      } catch (err) {
        return next(new Error(err))
      }
    case WEATHER_TYPES.SPECIAL:
      try {
        let data

        if (date) {
          // Fetch data by date_created
          data = await queryGetSpecialArchivesByDate(date)
        }

        if (month && year) {
          // Fetch data by month and year
          data = await queryGetSpecialArchivesByMonthYear({ month, year })
        }

        if (data.length === 0) {
          return res.status(404).send(`Selected data for ${province} does not exist.`)
        } else {
          return res.status(200).send(data)
        }
      } catch (err) {
        return next(new Error(err))
      }
    default:
      return res.status(500).send('Unsupported weather type')
  }
}
