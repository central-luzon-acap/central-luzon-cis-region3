import { WeatherForecast } from './weatherforecast'

const WEATHER_SERVICE = new WeatherForecast()

export const upsertSeasonal = WEATHER_SERVICE.upsertSeasonal.bind(WEATHER_SERVICE)
export const upsertSeasonalExcel = WEATHER_SERVICE.upsertSeasonalExcel.bind(WEATHER_SERVICE)
export const getweathercondition = WEATHER_SERVICE.getweathercondition.bind(WEATHER_SERVICE)
export const upsertTenDay = WEATHER_SERVICE.upsertTenDay.bind(WEATHER_SERVICE)
export const updateCommonWeather = WEATHER_SERVICE.updateCommonWeather.bind(WEATHER_SERVICE)
