import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '@/store/constants'
import { fetchTendayWeather } from '@/store/weather/tenday/tendayThunks'

const tenWeatherAdapter = createEntityAdapter({
  selectId: (tenday) => tenday.id,
  sortComparer: (a, b) => a.municipality.localeCompare(b.municipality)
})

const tenWeatherSlice = createSlice({
  name: 'tenday_weather',
  initialState: tenWeatherAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    currentLogs: null
  }),
  reducers: {
    tenWeatherLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = ''
    },
    tenWeatherReceived (state, action) {
      tenWeatherAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.currentLogs = undefined
      state.status = ADAPTER_STATES.FULLFILLED
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTendayWeather.fulfilled, (state, { payload }) => {
      tenWeatherAdapter.setAll(state, payload.data)
      state.currentRequestId = undefined
      state.currentLogs = payload.currentLogs
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchTendayWeather.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.currentLogs = undefined
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  tenWeatherLoading,
  tenWeatherReceived
} = tenWeatherSlice.actions

export default tenWeatherSlice.reducer
