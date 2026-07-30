import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import { fetchCropCalendar } from '@/store/crop_calendar/cropcalendarThunks'

const cropcalendarAdapter = createEntityAdapter({
  selectId: (calendar_record) => calendar_record.id,
  // sortComparer: (a, b) => a.label.localeCompare(b.label)
})

const cropcalendarSlice = createSlice({
  name: 'cropcalendar',
  initialState: cropcalendarAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    filtered_calendar: []
  }),
  reducers: {
    cropcalendarLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = ''
    },
    cropcalendarReceived (state, action) {
      cropcalendarAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.error = ''
      state.filtered_calendar = []
      state.status = ADAPTER_STATES.FULLFILLED
    },
    calendarReceived (state, action) {
      state.filtered_calendar = action.payload
    },
    calendarReset (state) {
      state.filtered_calendar = []
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCropCalendar.fulfilled, (state, { payload }) => {
      cropcalendarAdapter.setAll(state, payload)
      state.currentRequestId = undefined
      state.filtered_calendar = []
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchCropCalendar.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.filtered_calendar = []
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  cropcalendarLoading,
  cropcalendarReceived,
  calendarReceived,
  calendarReset
} = cropcalendarSlice.actions

export default cropcalendarSlice.reducer
