import { createAsyncThunk } from '@reduxjs/toolkit'
import { getTenDayProvince } from '@/services/weatherforecast_getter'
import { tenWeatherLoading } from '@/store/weather/tenday/tendaySlice'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'

export const fetchTendayWeather = createAsyncThunk('tenday_weather/list',
  async (province, thunkAPI) => {
    thunkAPI.dispatch(tenWeatherLoading(thunkAPI.requestId))

    try {
      const response = await getTenDayProvince(province)
      const temp = Object.values(response[0].municipalities)[0][0]

      if (!response || response.length === 0) {
        thunkAPI.rejectWithValue('Received an empty weather data.')
      }

      const currentDate = response[0].date_created.toDate()

      // TO-DO: Check if the current date is included in the 10-day dates

      return {
        currentLogs: {
          province: response[0].name,
          date_synced: `${currentDate.toDateString()} ${currentDate.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`,
          updated_by: (response[0].updated_by === 'system') ? response[0].updated_by : 'admin',
          date_forecast: temp.date_forecast,
          date_valid: temp.date_range
        },
        data: Object.keys(response[0].municipalities).map((municipality, index) => ({
          id: index,
          municipality,
          data: JSON.stringify(response[0].municipalities[municipality])
        }))
      }
    } catch (err) {
       return thunkAPI.rejectWithValue(err.message)
    }
})
