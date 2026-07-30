import { createAsyncThunk } from '@reduxjs/toolkit'
import { getCroppingCalendarMunicipality } from '@/services/crop_calendar'
import { cropcalendarLoading } from '@/store/crop_calendar/cropcalendarSlice'

export const fetchCropCalendar = createAsyncThunk('cropcalendar/list',
  async (location, thunkAPI) => {
    thunkAPI.dispatch(cropcalendarLoading(thunkAPI.requestId))

    try {
      const response = await getCroppingCalendarMunicipality(
        location.province,
        location.municipality
      )

      if (response.length === 0) {
        return thunkAPI.rejectWithValue('Received empty data')
      } else {
        return response
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})
