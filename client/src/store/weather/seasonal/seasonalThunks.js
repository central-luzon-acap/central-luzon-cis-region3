import { createAsyncThunk } from '@reduxjs/toolkit'
import { getWeatherForecast } from '@/services/weatherforecast_getter'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { seasonalWeatherLoading } from '@/store/weather/seasonal/seasonalSlice'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'

export const fetchSeasonalWeather = createAsyncThunk('seasonal_weather/list',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(seasonalWeatherLoading(thunkAPI.requestId))

    try {
      const response = await getWeatherForecast(process.env.REGION_NAME, _WeatherForecastGetter.SUB_SEASONAL)

      return response.map(record => {
        const currentDate = record.date_created.toDate()
        const date_created = `${currentDate.toDateString()} ${currentDate.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`

        return {
          ...record,
          date_created
        }
      })
    } catch (err) {
       return thunkAPI.rejectWithValue(err.message)
    }
})
