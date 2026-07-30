const OpenWeather = require('./openweather')
const OWM = new OpenWeather()

const getweathertoday = OWM.getweathertoday.bind(OWM)

module.exports = {
  getweathertoday
}
