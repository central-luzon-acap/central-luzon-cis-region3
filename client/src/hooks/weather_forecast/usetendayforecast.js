import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WEATHER_CONDITION_LABELS } from '@/utils/constants'
import { fetchTendayWeather } from '@/store/weather/tenday/tendayThunks'
import { getRangedMonths, getFullDateForSelectedTendayDate } from '@/utils/date'
import { ADAPTER_STATES } from '@/store/constants'

/**
 * Fetches the 10-day weather forecast of a province and finds the (minimal) 10-day weather forecast data and summary of a municipality.
 * @param {String} province - Province name
 * @param {String} municipality - Municipality name
 * @returns {Object}
 *    - days: {Object[]} Constant (max 10) 10-day weather forecast dates,
 *      i.e.: [{ id: 1, label: 'Mon Oct 17 ', rainfall: 'LIGHT RAINS', forecast: 'Below Normal' },... ]
 *    - summary: {Object} General 10-day weather forecast summary with 1st half or 2nd half month details per inclusive month from the start date,
 *      i.e.: { months: Object[], date_start: Date, date_range: String }
 *    - loading: {Bool} Flag for on-going 10-day data fetching process
 *    - error: {String} 10-day weather forecast loading or processing errors
 */
export default function useTendayForecast (province, municipality) {
  const [days, setDays] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const {
    ids: idsTen,
    status: tenLoading,
    entities: tendayWeatherData,
    error: tenError
  } = useSelector((state) => state.tendayweather)

  useEffect(() => {
    if (province !== null) {
      setError('')
      setWarning('')
      dispatch(fetchTendayWeather(province))
    }
  }, [province, dispatch])

  useEffect(() => {
    setError(tenError)
  }, [tenError])

  useEffect(() => {
    setLoading(tenLoading === ADAPTER_STATES.PENDING)
  }, [tenLoading])

  useEffect(() => {
    setError('')
    setWarning('')

    if (tenLoading === ADAPTER_STATES.FULLFILLED &&
      idsTen.length > 0 &&
      tenError === '' &&
      municipality !== null
    ) {
      const tempMunicipality = Object.values(tendayWeatherData).find(record => record.municipality === municipality)

      if (tempMunicipality !== undefined) {
        const weatherData = JSON.parse(tempMunicipality.data)
        const normalForecastLabels = Object.values(WEATHER_CONDITION_LABELS)

        // Set the formatted 10-day labels with rainfall forecast from day 1 to 10
        setDays(weatherData.reduce((dayoptions, curr, id) => [...dayoptions, {
          id,
          label: curr.day_format,
          label_full: getFullDateForSelectedTendayDate(curr.day_format, weatherData[9].day_format)?.toDateString(),
          rainfall: curr.rainfall,
          forecast: normalForecastLabels.find(x => x.tenday === curr.rainfall)?.sync ?? '-',
          code: normalForecastLabels.find(x => x.tenday === curr.rainfall)?.label ?? '-'
        }], []))

        // Find the 10-day weather forecast general information
        // Fine-tune stages detection - include date range of applicable months(s)
        // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
        // with 1st half or 2nd half month details per inclusive month depending on the start date
        // of the date range's "start date"
        const dateRangeStart = new Date(weatherData[0].date_start.seconds * 1000)
        const months = getRangedMonths(dateRangeStart)

        // Check valid years. "weatherData[0].date_start" is always a timestamp.
        const startYear = dateRangeStart.getFullYear()
        const yearNow = new Date().getFullYear()

        if (startYear !== yearNow && process.env.NEXT_PUBLIC_CHECK_RANGE_YEAR === '1') {
          setError(`Invalid year detected in the 10-day validity date range: ${weatherData[0].date_range}`)
        }

        setSummary({
          months,
          date_start: dateRangeStart,
          date_range: weatherData[0].date_range
        })
      } else {
        const errMsg = (tenError)
          ? tenError
          : 'Weather data for the municipality is not available at the moment, however, you can continue viewing recommendations. Please verify that the municipality name is present in the 10-Day weather forecast.'

        if (tenError) {
          setDays([])
          setSummary(null)
          setError(errMsg)
        } else {
          setWarning(errMsg)
        }
      }
    }
  }, [municipality, tendayWeatherData, idsTen, tenLoading, tenError])

  return { days, summary, loading, error, warning }
}
