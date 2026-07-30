const axios = require('axios')

class OpenWeather {
  // Get the current weather today with 7 days forecast from Openweather's onecall API
  async getweathertoday (lat, lon) {
    const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall'

    try {
      return await axios.get(baseUrl, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHERMAP_APPID,
          exclude: 'minutely,hourly,alerts',
          units: 'metric'
        }
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = OpenWeather
