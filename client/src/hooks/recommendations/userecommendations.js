import { useState, useEffect } from 'react'
import { CROP_STAGE_CODES, CROP_STAGE_LABELS } from '@/utils/constants/croppingcalendar'

/**
 * Groups a set of recommendations by crop stages - farm operation
 * @param {Object[]} recommendations - Firestore documents containing recommendations
 * @returns {Object} Recommendations with crop stages as keys. Each crop stage contains farm operations as keys, and each farm operation contains an array of recommendations i.e.:
 *    {
 *       "Newly-Planted": {
 *          "Planting/Transplanting": [{ id: 0, crop_stage, farm_operation, practice,... }...],
 *          ...
 *       },
 *       "Vegetative/Reproductive": {
 *          "Fertlizer Application": [{ id: 0, crop_stage, farm_operation, practice,... }...],
 *          "Pest and Weed Management": [{ id: 0, crop_stage, farm_operation, practice,... }...],
 *          ...
 *       },
 *       ...
 *    }
 */
export default function useRecommendations (recommendations) {
  const [group, setGroupedRecommendations] = useState(null)
  const [error, setError] = useState('')

  // Returns a list of unique farm operations following the format [{ id, label },...]
  const getFarmOperations = (list) => list.map(item => item.farm_operation).filter((x, i, a) => a.indexOf(x) === i)

  useEffect(() => {
    setError('')

    if (recommendations.length > 0) {
      const farmops = getFarmOperations(recommendations)

      try {
        setGroupedRecommendations(CROP_STAGE_CODES.reduce((collections, stage) => {
          // Filter by farm operations
          farmops.forEach(activity => {
            // Crop stage text label
            const cropstageLabel = CROP_STAGE_LABELS[stage]

            // Filtered recommendations
            const recs = recommendations.filter(recommendation =>
              recommendation.crop_stage === stage && recommendation.farm_operation === activity)

            if (recs.length > 0 && cropstageLabel) {
              // Create a crop stage group
              if (collections[cropstageLabel] === undefined) {
                collections[cropstageLabel] = {}
              }

              if (collections[cropstageLabel][activity] === undefined) {
                collections[cropstageLabel][activity] = []
              }

              // Store the recommendation it its stage-activity group
              collections[cropstageLabel][activity] = [ ...collections[cropstageLabel][activity], ...recs ]
            }
          })

          return collections
        }, {}))
      } catch (err) {
        setGroupedRecommendations(null)
        setError(err)
      }
    } else {
      setGroupedRecommendations(null)
    }
  }, [recommendations])

  return { group, error }
}
