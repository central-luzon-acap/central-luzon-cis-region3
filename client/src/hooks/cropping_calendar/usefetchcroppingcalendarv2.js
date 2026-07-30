import { useEffect, useState } from 'react'
import {
  getCroppingCalendarV2Province,
  getCropStages
} from '@/services/crop_calendar'

/**
 * Return the raw cropping calendar v2 of a province and municipality combo
 * @param {String} province - Province
 * @param {String} cropName - Crop name
 * @returns {Object} { cropcalendar, loading, error }
 *    - cropcalendar: {Object[]} Crop calendar data of municipalities under a province
 *    - cropStages {Object} Crop stages of the input crop, containing crop stage codes as keys. Follows the sample format:
 *      ```
 *      { mat: { index: 6, code: 'mat', label: 'Maturing' },... }
 *      ```
 *    - loading: {Bool} Flag for on-going data fetch
 *    - error: {String} Data loading error
 */
export default function useFetchCroppingCalendarV2(type, province, cropName) {
  const [cropcalendar, setCropCalendar] = useState([])
  const [cropStages, setCropStages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetData = () => {
    setError('')
    setCropCalendar([])
    setCropStages([])
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const calData = await getCroppingCalendarV2Province(
          type,
          province,
          cropName
        )
        setCropCalendar(calData?.data ?? [])

        const cropStagesData = await getCropStages(type, cropName)
        setCropStages(cropStagesData?.data ?? [])

        setLoading(false)
        setError('')
      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
        setCropCalendar([])
      }
    }

    if (province && cropName) {
      resetData()
      load()
    }
  }, [type, province, cropName])

  return { cropcalendar, cropStages, loading, error }
}
