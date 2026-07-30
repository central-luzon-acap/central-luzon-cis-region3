const { getforecast } = require('../../../../classes/tendayforecast')
const { gettendayregionaldoc } = require('../../../../classes/regionaltenday')
const {
  WEATHER_CONDITION_LABELS,
  FIRESTORE_DOCUMENTS,
  REGION
} = require('../../../../utils/constants')

/**
 * Fetch the latest snapshot of the 10-Day weather forecast
 * @returns {Object[]} Latest 10-Day weather forecast with structire formatted
 *    for use on the 10-Day EJS template
 */
const getTendayWeatherForecast = async ({ region, province, municipality }) => {
  const weatherforecast = []
  let moonPhasesData = []

  try {
    // Fetch the common seasonal regional weather forecast - no. of tropical cyclones data
    const moonPhases = await gettendayregionaldoc({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES
    })

    // Include the no. of tropical cyclones for each month in formattedMonths
    if (!moonPhases.exists) {
      throw new Error(new Error('Failed to fetch the moon phases data.'))
    } else {
      moonPhasesData = moonPhases.data().data
    }
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    const weatherSnap = await getforecast({ region, province })

    if (weatherSnap.exists) {
      const weatherToday = Object.values(
        weatherSnap.data().municipalities[municipality]
      )
      // let currentYear = new Date().getFullYear().toString()
      // currentYear = currentYear.substring(2, currentYear.length)
      const conditionValues = Object.values(WEATHER_CONDITION_LABELS)

      if (!weatherToday) {
        return undefined
      }

      weatherToday.forEach((item, index) => {
        const dateParts = item.day_format.split(' ')
        const obj = {
          day: dateParts[0],
          date: `${dateParts.slice(1).join('-')}`,
          temp: item.tmean.toFixed(2),
          wspeed: item.wspeed.toFixed(2),
          cover: item.cover.toLowerCase(),
          forecast: item.rainfall.toLowerCase(),
          mm: conditionValues.find((x) => x.tenday === item.rainfall).mm,
          valid_until: item.date_range
        }

        weatherforecast.push(obj)
      })
    }

    return {
      weatherforecast,
      moonPhasesData
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = getTendayWeatherForecast
