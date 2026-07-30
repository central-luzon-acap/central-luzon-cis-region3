import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import { REPORT_TYPE } from '@/utils/constants/app'

const dashboardAdapter = createEntityAdapter({
  selectId: (app) => app.id,
})

// Persist global app-wide miscellaneous user preferences
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: dashboardAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    message: '',
    error: '',
    reportType: REPORT_TYPE.SEASONAL,
    showWelcome: true,
    isEnglish: true
  }),
  reducers: {
    reportTypeReceived (state, action) {
      state.reportType = action.payload
    },
    shouldShowWelcome (state, action) {
      state.showWelcome = action.payload
    },
    setIsEnglishGlobal (state) {
      state.isEnglish = !state.isEnglish
    }
  }
})

export const {
  reportTypeReceived,
  shouldShowWelcome,
  setIsEnglishGlobal
} = dashboardSlice.actions

export default dashboardSlice.reducer
