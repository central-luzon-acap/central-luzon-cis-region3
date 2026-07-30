import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useDocument } from '@/hooks/usefirestore'
import { ADAPTER_STATES } from '@/store/constants'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { _Region } from '@/services/region/region'
import { getFirestoreDateTimeString } from '@/utils/date'
import WeatherSystemsComponent from './weathersystems'

const defaultUpdatedBy = {
  miscUpdater: '-',
  miscDate: '-',
  seasonalUpdater: '-',
  seasonalDate: '-',
  seasonalMethod: '-'
}

function WeatherSystems () {
  const [data, setData] = useState([])
  const [monthHeaders, setMonthHeaders] = useState([])
  const [updatedBy, setUpdatedBy] = useState(defaultUpdatedBy)
  const mounted = useRef(false)

  // Tropical Cyclones Data
  const [tropicalCyclones, tcLoading] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_SEASONAL_COMMON}/${_WeatherForecastGetter.COMMON_SEASONAL_REGIONAL_TYPE.CYCLONES_COUNT}`)

  // Misc weather systems data
  const [weatherSystems, wsLoading] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_SEASONAL_COMMON}/${_WeatherForecastGetter.COMMON_SEASONAL_REGIONAL_TYPE.MISC_WEATHER_SYSTEMS}`)

  // Province codes
  const [provincesInfo, pLoading] = useDocument(_Region.CONSTANTS, _Region.PROVINCES_INFO)

  // Seasonal weather data
  const {
    ids: sIds,
    status: fsLoading,
    entities: seasonalData,
  } = useSelector((state) => state.seasonalweather)

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    // Format the table data
    if (fsLoading === ADAPTER_STATES.FULLFILLED && sIds.length > 0 && !tcLoading && !wsLoading && !pLoading) {
      const data = []
      const months = []

      tropicalCyclones.data.forEach(item => {
        const month = `${item.month.charAt(0).toUpperCase()}${item.month.slice(1)}`
        const temp = [month, item.value]
        months.push(month)
        data.push(temp)
      })


      let index = 0

      for (let province in seasonalData) {
        const temp = [provincesInfo.data[province].code]

        seasonalData[province].months.forEach(month => {
          const displayValue = (month.dry === null)
            ? 'nda'
            : month.dry

          temp.push(displayValue)
        })

        // Insert blank month|tropical cyclones values to match table rows length
        // if provinces row is more than 6 (6 seasonal months) for display only
        if (index >= data.length) {
          data.push(['', ''])
        }

        data[index] = [...data[index], ...temp]
        index += 1
      }

      setData(data)
      setMonthHeaders(months)
      setUpdatedBy({
        miscUpdater: (weatherSystems.updated_by === 'system') ? 'system' : 'an admin',
        miscDate: getFirestoreDateTimeString(weatherSystems.date_created),
        seasonalUpdater: seasonalData[process.env.DEFAULT_PROVINCE].updated_by,
        seasonalDate: seasonalData[process.env.DEFAULT_PROVINCE].date_created,
        seasonalMethod: seasonalData[process.env.DEFAULT_PROVINCE].update_method
      })
    }
  }, [seasonalData, tropicalCyclones, provincesInfo, fsLoading, tcLoading, sIds, weatherSystems, wsLoading, pLoading])

  return (
    <WeatherSystemsComponent
      weathersystems={weatherSystems?.data || []}
      tableData={data}
      monthHeaders={monthHeaders}
      updatedBy={updatedBy}
    />
  )
}

export default WeatherSystems
