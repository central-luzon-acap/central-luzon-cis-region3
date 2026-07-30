import { useState, useEffect } from 'react'
import { WEATHER_CONDITION_LABELS } from '@/utils/constants'
const defaultForecast = { forecast: '', label: '', value: 0 }

/**
 * Find the seasonal weather forecast summary of a selected month from province
 * @param {String} provinceForecast - Province seasonal weather forecast
 * @param {String} month - Month code
 * @returns {Object}
 *    - forecast: {String} acap weather forecast (condition) code
 *    - value: {Number} numerical rainfall value
 *    - label: {String} formatted acap weather forecast label
 */
export default function useSeasonalForecast (provinceForecast, month) {
  const [forecast, setWeatherForecast] = useState(defaultForecast)

  useEffect(() => {
    if (provinceForecast.months !== undefined && month) {
      const monthForecast = provinceForecast.months.find(rec => rec.mo === month.id)
      const forecastDetail = Object.values(WEATHER_CONDITION_LABELS).find(x => x.label === monthForecast?.con ?? '')

      setWeatherForecast({
        forecast: monthForecast?.con ?? '',
        value: monthForecast?.val ?? 0,
        label: forecastDetail?.sync ?? '-',
        code: forecastDetail?.label ?? '-'
      })
    }
  }, [provinceForecast, month])

  return { forecast }
}
