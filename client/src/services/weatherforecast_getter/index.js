import { WeatherForecastGetter } from './weatherforecast_getter'

const WF = new WeatherForecastGetter()

export const getWeatherForecast = WF.getWeatherForecast.bind(WF)
export const getTenDayStats = WF.getTenDayStats.bind(WF)
export const getTenDayProvince = WF.getTenDayProvince.bind(WF)
export const getCommonWeatherData = WF.getCommonWeatherData.bind(WF)
