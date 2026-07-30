import { SpecialWeatherAdvisory } from './specialweather'

const SPECIAL_WEATHER = new SpecialWeatherAdvisory()

export const updateSpecialWeather = SPECIAL_WEATHER.updateSpecialWeather.bind(SPECIAL_WEATHER)

