import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getReports,
  createTendayReport,
  createSpecialWeatherReport,
  deleteReport,
  createReport
} from '@/services/report'
import { reportsLoading } from '@/store/reports/reportSlice'
import { ADAPTER_STATES } from '../constants'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'

// Fetch all reports with optional report type filter
export const fetchReports = createAsyncThunk('reports/list',
  async (report, thunkAPI) => {
    thunkAPI.dispatch(reportsLoading(thunkAPI.requestId))

    try {
      const response = await getReports(report.uid, report.type)

      if (response.length === 0) {
        return thunkAPI.rejectWithValue('Received empty data')
      } else {
        return response.map(item => ({
          ...item,
          date_created: `${item.date_created.toDate().toDateString()} ${item.date_created.toDate().toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
        }))
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})

// Create a new Seasonal report
export const createSeasonalReport = createAsyncThunk('reports/create/seasonal',
  async(report, thunkAPI) => {
    const { loading } = thunkAPI.getState().reports

    // Create a Report if there are no previous create requests
    if (loading === ADAPTER_STATES.PENDING) {
      return
    }

    thunkAPI.dispatch(reportsLoading(thunkAPI.requestId))
    const response = await createReport(report)
    const dateCreated = new Date(response.date_created._seconds * 1000)
    response.date_created = `${dateCreated.toDateString()} ${dateCreated.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
    return response
  })

// Create a new 10-Day report
export const createTenDReport = createAsyncThunk('reports/create/tenday',
  async(report, thunkAPI) => {
    const { loading } = thunkAPI.getState().reports

    // Create a Report if there are no previous create requests
    if (loading === ADAPTER_STATES.PENDING) {
      return
    }

    try {
      thunkAPI.dispatch(reportsLoading(thunkAPI.requestId))
      const response = await createTendayReport(report)
      const dateCreated = new Date(response.date_created._seconds * 1000)
      response.date_created = `${dateCreated.toDateString()} ${dateCreated.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
      return response
    } catch (err) {
      let errMsg = ''

      if (err.response !== undefined) {
        errMsg = err.response.data !== undefined ? err.response.data : ''
      }

      if (errMsg === '') {
        errMsg = err.message
      }

      return thunkAPI.rejectWithValue(errMsg)
    }
  })

// Create a new Special Weather report
export const createSpecialWReport = createAsyncThunk('reports/create/special',
  async(report, thunkAPI) => {
    const { loading } = thunkAPI.getState().reports

    // Create a Report if there are no previous create requests
    if (loading === ADAPTER_STATES.PENDING) {
      return
    }

    try {
      thunkAPI.dispatch(reportsLoading(thunkAPI.requestId))
      const response = await createSpecialWeatherReport(report)
      const dateCreated = new Date(response.date_created._seconds * 1000)
      response.date_created = `${dateCreated.toDateString()} ${dateCreated.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
      return response
    } catch (err) {
      let errMsg = ''

      if (err.response !== undefined) {
        errMsg = err.response.data !== undefined ? err.response.data : ''
      }

      if (errMsg === '') {
        errMsg = err.message
      }

      return thunkAPI.rejectWithValue(errMsg)
    }
  })

// Delete an existing (seasonal or 10-day) report
export const deleteExistingReport = createAsyncThunk(
  'reports/delete',
  async(reportId, thunkAPI) => {
    const { loading } = thunkAPI.getState().reports

    // Delete a Todo if there are no previous create requests
    if (loading === ADAPTER_STATES.PENDING) {
      return
    }

    thunkAPI.dispatch(reportsLoading(thunkAPI.requestId))
    const response = await deleteReport(reportId)
    return response.data
  })