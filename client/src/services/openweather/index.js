import OpenWeather from './openweather'

const OPENWEATHER_SERVICE = new OpenWeather()
export const getWeatherToday = OPENWEATHER_SERVICE.getWeatherToday.bind(OPENWEATHER_SERVICE)
