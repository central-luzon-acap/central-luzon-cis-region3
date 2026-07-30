import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import { fetchMunicipalities } from '@/store/municipalities/municipalityThunks'

const municipalitiesAdapter = createEntityAdapter({
  selectId: (municipality) => municipality.id,
  sortComparer: (a, b) => {
    const key = a.label !== undefined ? 'label' : 'municipality'
    return a[key].localeCompare(b[key])
  }
})

const provinceSlice = createSlice({
  name: 'municipalities',
  initialState: municipalitiesAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    municipality: null
  }),
  reducers: {
    municipalitiesLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.error = ''
    },
    municipalitiesReceived (state, action) {
      municipalitiesAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.error = ''
      state.municipality = null
      state.status = ADAPTER_STATES.IDLE
    },
    municipalityReceived (state, action) {
      state.municipality = action.payload
    },
    municipalityReset (state) {
      state.municipality = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMunicipalities.fulfilled, (state, { payload }) => {
      const insertLabel = payload.map(item => ({ ...item, label: item.label }))
      municipalitiesAdapter.setAll(state, Object.values(payload))
      state.currentRequestId = undefined

      // Auto-select a province
      state.municipality = (payload.length > 0)
        ? insertLabel[0] : null
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchMunicipalities.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.municipality = null
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  municipalitiesLoading,
  municipalitiesReceived,
  municipalityReceived,
  municipalityReset,
} = provinceSlice.actions

export default provinceSlice.reducer
