import axios from 'axios'
import RequestObject from '@/utils/requestobject'
import { WEATHER_CONDITION_LABELS } from '@/utils/constants'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'

export const _WeatherForecast = {
  BASE_API_URL: process.env.BASE_API_URL,
  WEATHER_FORECAST_SEASONAL_EXCEL: `${process.env.BASE_API_URL}/weather/seasonal/excel`,
  WEATHER_FORECAST_SEASONAL: `${process.env.BASE_API_URL}/weather/seasonal/region`,
  WEATHER_FORECAST_SEASONAL_UPDATE: `${process.env.BASE_API_URL}/weather/seasonal/region/common`,
  WEATHER_FORECAST_TENDAY_UPDATE: `${process.env.BASE_API_URL}/weather/tenday/region/common`,
  WEATHER_FORECAST_SPECIAL_UPDATE: `${process.env.BASE_API_URL}/weather/cyclone/region/common`,
  WEATHER_FORECAST_PROVINCE: `${process.env.BASE_API_URL}/weather/seasonal/province`,
  WEATHER_FORECAST_TEN_DAY: `${process.env.BASE_API_URL}/weather/10day`
}

export class WeatherForecast extends RequestObject {
  async upsertSeasonal (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _WeatherForecast.WEATHER_FORECAST_SEASONAL, method: 'POST' })
    return res.data
  }

  async upsertTenDay (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _WeatherForecast.WEATHER_FORECAST_TEN_DAY, method: 'POST' })
    return res.data
  }

  async upsertSeasonalExcel (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _WeatherForecast.WEATHER_FORECAST_SEASONAL_EXCEL, method: 'POST' })
    return res.data
  }

  async updateCommonWeather ({ type, body }) {
    let url = (type === _WeatherForecastGetter.SUB_SEASONAL_COMMON)
      ? _WeatherForecast.WEATHER_FORECAST_SEASONAL_UPDATE
      : _WeatherForecast.WEATHER_FORECAST_TENDAY_UPDATE

    if (type === _WeatherForecastGetter.SUB_SPECIAL_COMMON) {
      url = _WeatherForecast.WEATHER_FORECAST_SPECIAL_UPDATE
    }

    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url, method: 'POST' })
    return res.data
  }

  getweathercondition (value) {
    let condition = ''

    if (!isNaN(value)) {
      throw new Error(`${value} is not a number`)
    }

    // PAGASA rainfall amount legends and naming conventions
    // Note: See WEATHER_CONDITION_LABELS.sync to get the formatted values displayed on UI
    const finalValue = Math.round(parseFloat(value))

    if (finalValue <= 40) {
      condition = WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label
      // ACAP: 'drier'
    }

    if (finalValue >= 41 && finalValue <= 80) {
      condition = WEATHER_CONDITION_LABELS.BELOW_NORMAL.label
      // ACAP: 'normal'
      // ACAP: (41 >= value <= 120)
    }

    if (finalValue >= 81 && finalValue <= 120) {
      condition = WEATHER_CONDITION_LABELS.NEAR_NORMAL.label
      // ACAP: 'normal'
      // ACAP: (41 >= value <= 120)
    }

    if (finalValue > 120) {
      condition = WEATHER_CONDITION_LABELS.ABOVE_NORMAL.label
      // ACAP: 'wetter'
    }

    return condition
  }
}
