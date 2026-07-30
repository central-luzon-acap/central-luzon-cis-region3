import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { rawRecommendationsReceived } from '@/store/recommendations/recommendationSlice'

import {
  getRecommendations,
  getRecommendationsFlexible,
  getSeasonalGeneralRecommendations
} from '@/services/crop_recommendations_v2'

/**
 * Return a list of crop recommendations for the given crop stage(s) and weather forecast
 * @param {String} cropstage - Crop stage code if multipleStages=false. Comma-separated crop stage codes if multipleStages=true.
 * @param {String} forecast - Formatted seasonal weather forecast label
 * @param {String} type - Type of crop recommendation. One of RECOMMENDATION_TYPE.
 * @param {Bool} multipleStages - Query Firestore for recommendations with multiple crop stages. Default is false.
 *    - multipleStages=false: Provide a single crop stage name in the "cropstage" param,
 *      i.e.: "Newly Planted"
 *    - multipleStages=true: Provide a comma-separated multiple crop stage names in the "cropstage" param,
 *      i.e., "Newly Planted,Vegetative/Reproductive"
 * @returns {Object} { recommendations, farmoperations, loading, error }
 *    - recommendations: {Object[]} Crop recommendations list in [{ id, crop_stage, impact, practice,... },...] format
 *    - farmoperations: {Object[]} List of unique farm operations,
 *      i.e., [{ id, label },...]
 *    - loading: {Bool} Loading data flag
 *    - error: {String} Error message
 */
export default function useFetchRecommendations(
  climateRisk,
  cropStage,
  crop,
  type,
  multipleStages = false,
  isFlexibleQuery = false
) {
  const [recommendations, setRecommendations] = useState([])
  const [farmoperations, setFarmOperations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    const load = async () => {
      try {
        let recs = []
        setLoading(false)
        setError('')

        let _cropStage = cropStage

        if (typeof cropStage === 'object')
          _cropStage = cropStage.map((stage) => stage.code)

        if (!isFlexibleQuery) {
          recs = await getRecommendations({
            climateRisk,
            _cropStage,
            crop,
            type,
            multipleStages
          })
        } else {
          // Climate risk Firestore query not required
          recs = await getRecommendationsFlexible({
            _cropStage,
            crop,
            type,
            multipleStages
          })
        }

        const farmops = recs
          .map((item) => item.farming_activity)
          .filter((x, i, a) => a.indexOf(x) === i)
          .reduce((list, item, id) => {
            list.push({ id, label: item })
            return list
          }, [])

        setLoading(false)
        setFarmOperations(farmops)
        setRecommendations(recs || [])
        dispatch(rawRecommendationsReceived(recs || []))
      } catch (err) {
        // TO-DO: Check async error not catching here
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    const loadSeasonalGeneralRecoms = async () => {
      try {
        setLoading(false)
        setError('')

        const recs = await getSeasonalGeneralRecommendations({
          climateRisk,
          crop,
          type,
          multipleStages
        })
        setLoading(false)
        setFarmOperations([])
        setRecommendations(recs || [])
        dispatch(rawRecommendationsReceived(recs || []))
      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    if (cropStage?.length > 0 && crop) {
      load()
    } else if (crop) {
      loadSeasonalGeneralRecoms()
    } else {
      setRecommendations([])
      setFarmOperations([])
    }
  }, [
    climateRisk,
    cropStage,
    crop,
    type,
    multipleStages,
    isFlexibleQuery,
    dispatch
  ])

  return { recommendations, farmoperations, loading, error }
}
