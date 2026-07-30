import { useEffect, useState } from 'react'
import { getCroppingCalendarProvince } from '@/services/crop_calendar'

/**
 * Return the raw cropping calendar of a province and municipality combo
 * @param {String} province - Province name
 * @returns {Object} { cropcalendar, loading, error }
 *    - cropcalendar: {Object[]} Crop calendar data of municipalities under a province
 *    - loading: {Bool} Flag for on-going data fetch
 *    - error: {String} Data loading error
 */
export default function useFetchCroppingCalendar (province) {
  const [cropcalendar, setCropCalendar] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const calData = await getCroppingCalendarProvince(province)

        setLoading(false)
        setError('')
        setCropCalendar(calData?.data ?? [])
      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
        setCropCalendar([])
      }
    }

    if (province) {
      setError('')
      load()
    }
  }, [province])

  return { cropcalendar, loading, error }
}
