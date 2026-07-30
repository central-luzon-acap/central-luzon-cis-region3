import { useState, useEffect } from 'react'
import { getFormattedRecommendations, getFormattedRecommendationsFromStages } from '@/services/crop_recommendations'

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
export default function useFetchRecommendations (cropstage = null, forecast, type, multipleStages = false) {
  const [recommendations, setRecommendations] = useState([])
  const [farmoperations, setFarmOperations] = useState([])
  const [stage, setStage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setStage(cropstage)
  }, [cropstage])

  useEffect(() => {
    const load = async () => {
      try {
        let recs = []
        setLoading(true)
        setError('')

        if (!multipleStages) {
          recs = await getFormattedRecommendations({
            cropstage: stage,
            forecast: forecast?.code ?? '',
            type
          })
        } else {
          recs = await getFormattedRecommendationsFromStages({
            cropstages: stage.split(','),
            forecast: forecast?.code ?? '',
            type
          })
        }

        const farmops = recs.map(item => item.farm_operation)
          .filter((x, i, a) => a.indexOf(x) === i)
          .reduce((list, item, id) => {
            list.push({ id, label: item })
            return list
          }, [])

        setLoading(false)
        setFarmOperations(farmops)
        setRecommendations(recs || [])
      } catch (err) {
        // TO-DO: Check async error not catching here
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    if (stage) {
      load()
    } else {
      setRecommendations([])
      setFarmOperations([])
    }
  }, [stage, forecast, type, multipleStages])

  return { recommendations, farmoperations, loading, error }
}
