import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { rawRecommendationsReceived, recommendationReset } from '@/store/recommendations/recommendationSlice'
import { getRecommendationsQuery } from '@/services/crop_recommendations_v2'

/**
 * Returns a list of crop recommendations for the given crop name and wind signal
 * @param {String} crop - Crop name
 * @param {String} signal - PAGASA wind signal code
 * @param {String} type - Type of crop recommendation. One of RECOMMENDATION_TYPE.
 * @param {Bool} isDispatch - Flag to dispatch the fetched data to the recommendations store
 * @returns {Object} { recommendations,  loading, error }
 *    - recommendations: {Object[]} Crop recommendations list in [{ id, crop_stage, impact, practice,... },...] format
 *    - loading: {Bool} Loading data flag
 *    - error: {String} Error message
 */
export default function useFetchRecommendationsQuery ({ crop, signal, type = 'special', isDispatch = false }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    const load = async () => {
      try {
        const queries = [
          { field: 'crop', op: '==', value: crop },
          { field: 'wind_signal', op: '==', value: signal }
        ]

        setLoading(true)
        dispatch(recommendationReset())

        const docs = await getRecommendationsQuery({ type, queryFields: queries })

        setLoading(false)
        setRecommendations(docs)

        if (isDispatch) {
          dispatch(rawRecommendationsReceived(docs || []))
        }

        if ((docs || []).length === 0) {
          throw new Error('No available recommendations')
        }
      } catch (err) {
        setError(err?.response?.data ?? err.message)
        setLoading(false)
      }
    }

    if (crop && signal) {
      load()
    }
  }, [crop, signal, type, isDispatch, dispatch])

  return {
    recommendations,
    loading,
    error
   }
}
