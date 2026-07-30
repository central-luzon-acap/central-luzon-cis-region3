import axios from 'axios'
import RequestObject from '@/utils/requestobject'

export const _SpecialWeatherAdvisory = {
  SPECIAL_WEATHER_CYCLONE: `${process.env.BASE_API_URL}/cyclone`,
}

export class SpecialWeatherAdvisory extends RequestObject {
  async updateSpecialWeather (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _SpecialWeatherAdvisory.SPECIAL_WEATHER_CYCLONE, method: 'POST' })
    return res.data
  }
}
