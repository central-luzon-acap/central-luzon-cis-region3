import axios from 'axios'

export default class OpenWeather {
  constructor () {
    this.BASE_URL = process.env.BASE_API_URL
  }

  // Get the current weather today with 7 days forecast from Openweather's onecall API
  async getWeatherToday (lat, lon) {
    const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall'

    return await axios.get(baseUrl, {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHERMAP_APPID,
        exclude: 'minutely,hourly,alerts',
        units: 'metric'
      }
    })
  }
}
