import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

// Reducers
import provinceReducer from '@/store/provinces/provinceSlice'
import municipalitySlice from '@/store/municipalities/municipalitySlice'
import tenWeatherSlice from '@/store/weather/tenday/tendaySlice'
import seasonalSlice from '@/store/weather/seasonal/seasonalSlice'
import miscWeatherSystemsSlice from '@/store/weather_common/seasonal/miscsystemsSlice'
import recommendationSlice from '@/store/recommendations/recommendationSlice'
import cropcalendarSlice from '@/store/crop_calendar/cropcalendarSlice'
import reportSlice from '@/store/reports/reportSlice'
import dashboardSlice from '@/store/dashboard/dashboardSlice'
import userSlice from '@/store/users/userSlice'
import { USER_STATES } from '@/store/constants'

const combinedReducer = combineReducers({
  provinces: provinceReducer,
  municipalities: municipalitySlice,
  tendayweather: tenWeatherSlice,
  seasonalweather: seasonalSlice,
  seasonalcommon_misc: miscWeatherSystemsSlice,
  recommendations: recommendationSlice,
  cropcalendar: cropcalendarSlice,
  reports: reportSlice,
  dashboard: dashboardSlice,
  user: userSlice
})

const rootReducer = (state, action) => {
  if (state && state.user.authState === USER_STATES.SIGNED_OUT) {
    // Clear all store data
    state = undefined
  }

  return combinedReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer
})
