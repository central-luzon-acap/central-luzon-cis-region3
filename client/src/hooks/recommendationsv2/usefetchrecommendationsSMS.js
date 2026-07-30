import { useState, useEffect } from 'react'
import { getRecommendationsSMS } from '@/services/crop_recommendations_v2'

export default function useFetchRecommendationsSMS (crop, climateRisk, type) {
  const [recommendationsSMS, setRecommendationsSMS] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        let recs = []
        setLoading(false)
        setError('')

        recs = await getRecommendationsSMS({ crop, climateRisk, type })

        setLoading(false)
        setRecommendationsSMS(recs || [])

      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    if (crop && type) {
      load()
    } else {
      setRecommendationsSMS([])
    }
  }, [crop, climateRisk, type])

  return { recommendationsSMS, loading, error }
}