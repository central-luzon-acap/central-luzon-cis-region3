const {
  getforecast,
  formatSeasonalForecast
} = require('../../classes/sharedweatherforecast/seasonal')

/**
 * Fetch the current 10-day weather forecast data and format it for sharing with
 * 3rd party collaborators
 */
const publicSeasonalWeatherForecast = async (province) => {
  try {
    const response = await getforecast({
      region: process.env.REGION_NAME,
      province
    })

    if (!response.exists) {
      throw new Error('Data does not exist')
    }

    return formatSeasonalForecast(response.data())
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = publicSeasonalWeatherForecast
