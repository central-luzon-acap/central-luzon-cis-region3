import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '@/store/constants'
import {
  fetchCommonMiscWeather,
  upsertCommonMiscWeather
} from '@/store/weather_common/seasonal/miscsystemsThunks'

const miscWeatherSystemsAdapter = createEntityAdapter({
  selectId: (data) => data.id
})

// Handles the global (common) regional seasonal "misc weather systems that may affect the region" data for all provinces
const miscWeatherSystemsSlice = createSlice({
  name: 'seasonalcommon_misc',
  initialState: miscWeatherSystemsAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: ''
  }),
  reducers: {
    miscWeatherSystemsLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = '',
      state.date_created = '',
      state.updated_by = ''
    },
    miscWeatherSystemsReceived (state, action) {
      miscWeatherSystemsAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.status = ADAPTER_STATES.FULLFILLED
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCommonMiscWeather.fulfilled, (state, { payload }) => {
      miscWeatherSystemsAdapter.setAll(state, payload.data)
      state.date_created = payload.date_created
      state.updated_by = payload.updated_by
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchCommonMiscWeather.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.status = ADAPTER_STATES.IDLE
    })

    // Handle the upsert new Seasonal Misc Weather Systems events and state
    builder.addCase(upsertCommonMiscWeather.fulfilled, (state, action) => {
      const { requestId } = action.meta

      if (
        state.status === ADAPTER_STATES.PENDING &&
        state.currentRequestId === requestId
      ) {
        state.status = ADAPTER_STATES.FULLFILLED
        state.currentRequestId = undefined
        state.date_created = action.payload.date_created
        state.updated_by = action.payload.updated_by
        // Bulk insert the new and old items to the data collection
        miscWeatherSystemsAdapter.setAll(state, action.payload.data)
      }
    })

    builder.addCase(upsertCommonMiscWeather.rejected, (state, action) => {
      state.status = ADAPTER_STATES.IDLE
      state.error = action.payload
      state.currentRequestId = undefined
      state.date_created = ''
      state.updated_by = ''
    })
  }
})

export const {
  miscWeatherSystemsLoading,
  miscWeatherSystemsReceived
} = miscWeatherSystemsSlice.actions

export default miscWeatherSystemsSlice.reducer
