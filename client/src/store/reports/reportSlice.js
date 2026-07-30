import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import {
  fetchReports,
  createTenDReport,
  createSpecialWReport,
  createSeasonalReport,
  deleteExistingReport
} from '@/store/reports/reportThunks'

const reportAdatper = createEntityAdapter({
  selectId: (report) => report.id,
  sortComparer: (a, b) => (new Date(b.date_created) - new Date(a.date_created))
})

const reportSlice = createSlice({
  name: 'reports',
  initialState: reportAdatper.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    success: '',
    report: null
  }),
  reducers: {
    reportsLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      // state.report = null
      state.error = ''
      state.success = ''
    },
    reportsReceived (state, action) {
      reportAdatper.setAll(state, action.payload)
      state.currentRequestId = undefined
      // state.report = null
      state.error = ''
      state.success = ''
      state.status = ADAPTER_STATES.FULLFILLED
    },
    reportReceived (state, action) {
      state.report = action.payload
    },
    reportReset (state) {
      state.report = null
      state.error = ''
      state.success = ''
      state.status = ADAPTER_STATES.IDLE
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReports.fulfilled, (state, { payload }) => {
      reportAdatper.setAll(state, payload)
      state.currentRequestId = undefined
      // state.report = null
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchReports.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.report = null
      state.status = ADAPTER_STATES.IDLE
    })

    // Handle the create new 10-Day Report events and state
    builder.addCase(createTenDReport.fulfilled, (state, action) => {
      const { requestId } = action.meta

      if (
        state.status === ADAPTER_STATES.PENDING &&
        state.currentRequestId === requestId
      ) {
        state.status = ADAPTER_STATES.FULLFILLED
        state.currentRequestId = undefined
        state.report = action.payload
        state.success = action.payload.success
        // Insert the new Report to the collection of Reports
        reportAdatper.addOne(state, action.payload)
      }
    })

    builder.addCase(createTenDReport.rejected, (state, action) => {
      state.status = ADAPTER_STATES.IDLE
      state.error = action.payload
      state.currentRequestId = undefined
      state.report = null
    })

    // Handle the create new Special Weather Report events and state
    builder.addCase(createSpecialWReport.fulfilled, (state, action) => {
      const { requestId } = action.meta

      if (
        state.status === ADAPTER_STATES.PENDING &&
        state.currentRequestId === requestId
      ) {
        state.status = ADAPTER_STATES.FULLFILLED
        state.currentRequestId = undefined
        state.report = action.payload
        state.success = action.payload.success
        // Insert the new Report to the collection of Reports
        reportAdatper.addOne(state, action.payload)
      }
    })

    builder.addCase(createSpecialWReport.rejected, (state, action) => {
      state.status = ADAPTER_STATES.IDLE
      state.error = action.payload
      state.currentRequestId = undefined
      state.report = null
    })

    // Handle the create new Seasonal Report events and state
    builder.addCase(createSeasonalReport.fulfilled, (state, action) => {
      const { requestId } = action.meta

      if (
        state.status === ADAPTER_STATES.PENDING &&
        state.currentRequestId === requestId
      ) {
        state.status = ADAPTER_STATES.FULLFILLED
        state.currentRequestId = undefined
        state.report = action.payload
        state.success = action.payload.success
        // Insert the new Report to the collection of Reports
        reportAdatper.addOne(state, action.payload)
      }
    })

    builder.addCase(createSeasonalReport.rejected, (state, action) => {
      const { message } = action.error
      state.status = ADAPTER_STATES.IDLE
      state.error = message
      state.currentRequestId = undefined
      state.report = null
    })

    // Handle the delete Report events and state
    builder.addCase(deleteExistingReport.fulfilled, (state, action) => {
      const { requestId } = action.meta

      if (
        state.status === ADAPTER_STATES.PENDING &&
        state.currentRequestId === requestId
      ) {
        state.status = ADAPTER_STATES.FULLFILLED
        state.error = ''
        state.currentRequestId = undefined
        reportAdatper.removeOne(state, action.payload.id)
      }
    })

    builder.addCase(deleteExistingReport.rejected, (state, action) => {
      const { message } = action.error
      state.status = ADAPTER_STATES.IDLE
      state.error = message
      state.currentRequestId = undefined
      state.report = null
    })
  }
})

export const {
  reportsLoading,
  reportsReceived,
  reportReceived,
  reportReset
} = reportSlice.actions

export default reportSlice.reducer
