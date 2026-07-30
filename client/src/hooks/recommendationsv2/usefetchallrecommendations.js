import { useState, useEffect } from 'react'
import { getCropRecommendations } from '@/services/crop_recommendations_v2'

export default function useFetchAllCropRecommendations(cropType, type) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const cropRecommendations = await getCropRecommendations({
          crop: cropType,
          type,
        })
        setRecommendations(cropRecommendations || [])
      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    if (cropType && type) {
      load()
    }
  }, [cropType, type])

  return {
    recommendations,
    loading,
    error,
  }
}
