import FirestoreService from '@/utils/firestoreutils'

export const _WeatherForecastGetter = {
  WEATHER_FORECASTS: 'weather_forecasts',
  SUB_SEASONAL: 'seasonal',
  SUB_TEN_DAY: 'ten_day',
  SUB_SEASONAL_COMMON: 'seasonal_regional',
  SUB_TENDAY_COMMON: 'seasonal_tenday',
  SUB_SPECIAL_COMMON: 'seasonal_special_weather',
  // Type of province-common seasonal weather forecast data group
  COMMON_SEASONAL_REGIONAL_TYPE:  {
    CYCLONES_COUNT: 'cyclones_count',
    MISC_WEATHER_SYSTEMS: 'misc_weather_systems'
  },
  // Type of province-common 10-day weather forecast data group
  COMMON_TENDAY_TYPE: {
    MOON_PHASES: 'moon_phases'
  },
  COMMON_SPECIAL_TYPE: {
    WIND_SPEED: 'wind_speed'
  }
}

export class WeatherForecastGetter extends FirestoreService {
  getWeatherForecast = async (region, type) => {
    return await this.getNestedCollectionData(_WeatherForecastGetter.WEATHER_FORECASTS, region, type, 'name')
  }

  // Get (1) 10-day weather forecast province to get immediate data update stats
  async getTenDayStats () {
    const colRef = this.query(this.collection(this.db, _WeatherForecastGetter.WEATHER_FORECASTS, process.env.REGION_NAME, 'ten_day'),
      this.orderBy('name'), this.limit(1))

    const snapshot = await this.getDocs(colRef)
    const data = snapshot.docs
      .map((doc) => ({ ...doc.data() }))

    return data
  }

  // Retrieves the 10-day weather data
  // The data also contains a full municipalities list by province
  async getTenDayProvince (province) {
    const docRef = this.query(this.collection(this.db, _WeatherForecastGetter.WEATHER_FORECASTS, process.env.REGION_NAME, 'ten_day'), this.where('name', '==', province))
    const docSnap = await this.getDocs(docRef)

    return docSnap.docs
      .map((doc) => ({ ...doc.data() }))
  }

  /**
   * Retrieve the common (seasonal, 10-day, special) weather forecast data
   * @param {String} type - Weather forecast type (seasonal_regional|seasonal_tenday)
   * @param {String} group - Group of data under the weather forecast type
   * @returns
   */
  async getCommonWeatherData ({ type, group }) {
    const docSnap = await this.getDocumentData(
      `${_WeatherForecastGetter.WEATHER_FORECASTS}/${process.env.REGION_NAME}`,
      `${type}/${group}`
    )

   return docSnap
  }
}
