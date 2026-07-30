import { createAsyncThunk } from '@reduxjs/toolkit'
import { getFormattedRecommendations, getFormattedRecommendationsFromStages } from '@/services/crop_recommendations'
import { recommendationsLoading } from '@/store/recommendations/recommendationSlice'

/**
 * Return a list of crop recommendations for the given crop stage(s) and weather forecast.
 * @param {String} forecast - Weather forecast (rainfal condition) code
 * @param {String[]} stages - One or more crop stage codes
 * @param {String} type - Crop recommendation type. One of RECOMMENDATION_TYPE.
 */
export const fetchRecommendations = createAsyncThunk('recommendations/list',
  async (params, thunkAPI) => {
    thunkAPI.dispatch(recommendationsLoading(thunkAPI.requestId))
    const { forecast, stages, type } = params

    try {
      let response = []

      if (stages.length > 0) {
        response = await getFormattedRecommendationsFromStages({
          cropstages: stages,
          forecast: forecast ?? '',
          type
        })
      } else {
        response = await getFormattedRecommendations({
          cropstage: stages[0],
          forecast: forecast ?? '',
          type
        })
      }

      if (response.length === 0) {
        return thunkAPI.rejectWithValue('Received empty data')
      } else {
        return response
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})
