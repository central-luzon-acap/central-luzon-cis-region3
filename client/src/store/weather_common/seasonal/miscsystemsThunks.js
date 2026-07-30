import { createAsyncThunk } from '@reduxjs/toolkit'
import { getCommonWeatherData } from '@/services/weatherforecast_getter'
import { updateCommonWeather } from '@/services/weatherforecast'
import { miscWeatherSystemsLoading } from '@/store/weather_common/seasonal/miscsystemsSlice'
import { getTimestampDateTimeString, getFirestoreDateTimeString } from '@/utils/date'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'

export const fetchCommonMiscWeather = createAsyncThunk('seasonalcommon_misc/list',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(miscWeatherSystemsLoading(thunkAPI.requestId))

    try {
      const response = await getCommonWeatherData({
        type: _WeatherForecastGetter.SUB_SEASONAL_COMMON,
        group: _WeatherForecastGetter.COMMON_SEASONAL_REGIONAL_TYPE.MISC_WEATHER_SYSTEMS
      })

      return {
        data: response.data,
        updated_by: response.updated_by,
        date_created: getFirestoreDateTimeString(response.date_created)
      }
    } catch (err) {
       return thunkAPI.rejectWithValue(err.message)
    }
})

export const upsertCommonMiscWeather = createAsyncThunk('seasonalcommon_misc/upsert',
  async (data, thunkAPI) => {
    thunkAPI.dispatch(miscWeatherSystemsLoading(thunkAPI.requestId))

    try {
      const response = await updateCommonWeather({
        type: _WeatherForecastGetter.SUB_SEASONAL_COMMON,
        body: {
          data,
          region: process.env.REGION_NAME,
          type: _WeatherForecastGetter.COMMON_SEASONAL_REGIONAL_TYPE.MISC_WEATHER_SYSTEMS
        }
      })

      return {
        data: response.data,
        updated_by: response.updated_by,
        date_created: getTimestampDateTimeString(response.date_created),
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})