import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import { fetchProvinces } from '@/store/provinces/provinceThunks'

const provincesAdapter = createEntityAdapter({
  selectId: (province) => province.id,
  sortComparer: (a, b) => a.label.localeCompare(b.label)
})

const provinceSlice = createSlice({
  name: 'provinces',
  initialState: provincesAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    province: null,
    municipalities: {}
  }),
  reducers: {
    provincesLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = ''

    },
    provincesReceived (state, action) {
      provincesAdapter.setAll(state, action.payload.provinces)
      state.currentRequestId = undefined
      state.error = ''
      state.province = null
      state.municipalities = action.payload.municipalities
      state.status = ADAPTER_STATES.FULLFILLED
    },
    provinceReceived (state, action) {
      state.province = action.payload
    },
    provinceReset (state) {
      state.province = null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProvinces.fulfilled, (state, { payload }) => {
      const insertLabel = payload.provinces
      provincesAdapter.setAll(state, insertLabel)
      state.currentRequestId = undefined
      state.province = null
      state.municipalities = payload.municipalities

      // Auto-select a province
      state.province = (payload.length > 0)
        ? insertLabel[0] : null
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchProvinces.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.province = null
      state.municipalities = {}
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  provincesLoading,
  provincesReceived,
  provinceReceived,
  provinceReset
} = provinceSlice.actions

export default provinceSlice.reducer
