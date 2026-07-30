import {
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import { ADAPTER_STATES } from '../constants'
import { fetchRecommendations } from '@/store/recommendations/recommendationThunks'

const recommendationAdapter = createEntityAdapter({
  selectId: (recommendation) => recommendation.id,
  // sortComparer: (a, b) => a.label.localeCompare(b.label)
})

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState: recommendationAdapter.getInitialState({
    status: ADAPTER_STATES.IDLE,
    currentRequestId: null,
    error: '',
    /** Recommendations grouped by crop stages  */
    filtered_recommendations: [],
    /** Raw recommendations data */
    recommendations: []
  }),
  reducers: {
    recommendationsLoading (state, action) {
      state.status = ADAPTER_STATES.PENDING
      state.currentRequestId = action.payload || undefined
      state.filtered_recommendations = []
      state.error = ''
    },
    recommendationsReceived (state, action) {
      recommendationAdapter.setAll(state, action.payload)
      state.currentRequestId = undefined
      state.error = ''
      state.filtered_recommendations = []
      state.status = ADAPTER_STATES.FULLFILLED
    },
    filteredRecommendationReceived (state, action) {
      state.filtered_recommendations = action.payload
    },
    rawRecommendationsReceived (state, action) {
      state.recommendations = action.payload
    },
    recommendationReset (state) {
      state.filtered_recommendations = []
      state.recommendations = []
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRecommendations.fulfilled, (state, { payload }) => {
      recommendationAdapter.setAll(state, payload)
      state.currentRequestId = undefined
      state.filtered_recommendations = []
      state.status = ADAPTER_STATES.FULLFILLED
    })

    builder.addCase(fetchRecommendations.rejected, (state, action) => {
      const { message } = action.error
      state.error = `${message}. ${action.payload}`
      state.currentRequestId = undefined
      state.filtered_recommendations = []
      state.status = ADAPTER_STATES.IDLE
    })
  }
})

export const {
  recommendationsLoading,
  recommendationsReceived,
  filteredRecommendationReceived,
  rawRecommendationsReceived,
  recommendationReset
} = recommendationSlice.actions

export default recommendationSlice.reducer
