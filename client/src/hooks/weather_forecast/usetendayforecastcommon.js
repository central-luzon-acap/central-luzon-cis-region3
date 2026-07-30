import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTendayWeather } from '@/store/weather/tenday/tendayThunks'
import { getRangedMonths } from '@/utils/date'
import { ADAPTER_STATES } from '@/store/constants'
import { SAMPLE_LOCATION } from '@/utils/constants/weatherforecast'

/**
 * Returns the generic 10-day weather forecast summary common from a temporary-selected province and municipality for all 10 days only.
 * @param {String} province - Province name
 * @param {String} municipality - Municipality name
 * @returns {Object}
 *    - summary: {Object} General 10-day weather forecast summary with 1st half or 2nd half month details per inclusive month from the start date,
 *      i.e.: { months: Object[], date_start: Date, date_range: String }
 *    - loading: {Bool} Flag for on-going 10-day data fetching process
 *    - error: {String} 10-day weather forecast loading or processing errors
 */
export default function useTendayForecastCommons () {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const {
    ids: idsTen,
    status: tenLoading,
    entities: tendayWeatherData,
    error: tenError
  } = useSelector((state) => state.tendayweather)

  useEffect(() => {
    if (summary === null) {
      setError('')
      dispatch(fetchTendayWeather(SAMPLE_LOCATION.PROVINCE))
    }
  }, [summary, dispatch])

  useEffect(() => {
    setError(tenError)
  }, [tenError])

  useEffect(() => {
    setLoading(tenLoading === ADAPTER_STATES.PENDING)
  }, [tenLoading])

  useEffect(() => {
    setError('')

    if (tenLoading === ADAPTER_STATES.FULLFILLED && idsTen.length > 0 && tenError === '') {
      const tempMunicipality = Object.values(tendayWeatherData).find(record => record.municipality === SAMPLE_LOCATION.MUNICIPALITY)

      if (tempMunicipality !== undefined) {
        const weatherData = JSON.parse(tempMunicipality.data)

        // Find the 10-day weather forecast general information
        // Fine-tune stages detection - include date range of applicable months(s)
        // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
        // with 1st half or 2nd half month details per inclusive month depending on the start date
        // of the date range's "start date"
        const dateRangeStart = new Date(weatherData[0].date_start.seconds * 1000)
        const months = getRangedMonths(dateRangeStart)

        // Set the common weather forecast summary
        setSummary({
          months,
          date_start: dateRangeStart,
          date_range: weatherData[0].date_range
        })
      } else {
        const errMsg = 'Weather data for the municipality is not available at the moment. Please verify that the municipality name is present in the 10-Day weather forecast.'
        setSummary('')
        setError(errMsg)
      }
    }
  }, [tendayWeatherData, idsTen, tenLoading, tenError])

  return { summary, loading, error }
}
