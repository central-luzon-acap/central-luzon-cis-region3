import { useEffect, useState } from 'react'
import axios from 'axios'
const BASE_URL = process.env.BASE_API_URL

export function useOpenweather (lat, lon) {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/openweather`, {
          params: { lat, lon }
        })

        setLoading(false)
        setForecast(res.data)
      } catch (err) {
        let errMsg = ''

        if (err.response !== undefined) {
          errMsg = err.response.data !== undefined ? err.response.data : ''
        }

        if (errMsg === '') {
          errMsg = err.message
        }

        setError(errMsg)
      }
    }

    load()
  }, [lat, lon])

  return {forecast, loading, error}
}
