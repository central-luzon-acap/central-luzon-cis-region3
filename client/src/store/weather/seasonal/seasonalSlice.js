import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '@/store/constants'
import { fetchSeasonalWeather } from '@/store/weather/seasonal/seasonalThunks'

const seasonalWeatherAdapter = createEntityAdapter({
  selectId: (seasonal) => seasonal.name,
  // sortComparer: (a, b) => a.municipality.localeCompare(b.municipality)
})

const seasonalWeatherSlice = createSlice({
  name: 'seasonal_weather',
  initialState: seasonalWeatherAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
  }),
  reducers: {
    seasonalWeatherLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = ''
    },
    seasonalWeatherReceived (state, action) {
      seasonalWeatherAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.status = ADAPTER_STATES.FULLFILLED
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSeasonalWeather.fulfilled, (state, { payload }) => {
      seasonalWeatherAdapter.setAll(state, payload)
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchSeasonalWeather.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  seasonalWeatherLoading,
  seasonalWeatherReceived
} = seasonalWeatherSlice.actions

export default seasonalWeatherSlice.reducer
