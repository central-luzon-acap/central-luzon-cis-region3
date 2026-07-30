import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import TenDayForecast from './tenday_forecast'
import {
  municipalitiesReceived,
  municipalityReceived,
} from '@/store/municipalities/municipalitySlice'
import {
  provinceReceived,
  provinceReset,
} from '@/store/provinces/provinceSlice'
import { fetchTendayWeather } from '@/store/weather/tenday/tendayThunks'
import { ADAPTER_STATES } from '@/store/constants'

function TenDayForecastContainer() {
  const {
    ids: provinceIds,
    entities: provinces,
    municipalities,
    province,
  } = useSelector((state) => state.provinces)

  const { municipality } = useSelector((state) => state.municipalities)

  const {
    ids: tenIds,
    entities: tendayweather,
    status: tenStatus,
  } = useSelector((state) => state.tendayweather)

  const [municipalWeather, setMunicipalWeather] = useState([])
  const [pageInitialized, setPageInitialized] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(municipalityReceived(null))
  }, [dispatch])

  useEffect(() => {
    // Always reload and display the first province's weather data
    if (provinceIds.length > 0) {
      dispatch(provinceReceived(Object.values(provinces)[0]))
      dispatch(fetchTendayWeather(Object.values(provinces)[0].label))
        .unwrap()
        .then(() => {
          setPageInitialized(true)
        })
    }
  }, [dispatch, provinceIds, provinces])

  useEffect(() => {
    // Build the municipalities list from the 10-day weather data's municipalities
    if (
      tenIds.length > 0 &&
      tenStatus === ADAPTER_STATES.FULLFILLED &&
      pageInitialized &&
      province !== null
    ) {
      let currentMuni = null
      const provinceName = Object.keys(municipalities).find(
        (item) => item === province.label,
      )

      if (provinceName) {
        if (municipalities[provinceName].length > 0) {
          currentMuni = municipalities[provinceName][0]
        }
      }

      dispatch(municipalitiesReceived(municipalities[province.label] || []))
      dispatch(municipalityReceived(currentMuni))
    }
  }, [
    dispatch,
    tenIds,
    tendayweather,
    tenStatus,
    pageInitialized,
    municipalities,
    province,
  ])

  useEffect(() => {
    // Build the weather data format for the daily cards
    if (municipality !== null && pageInitialized) {
      const mdata = Object.values(tendayweather).find(
        (weather) => weather.municipality === municipality.label,
      )

      if (mdata) {
        setMunicipalWeather(
          JSON.parse(mdata.data).map((x) => ({
            day: x.day_format,
            temp_avg: x.tmean,
            wspeed: x.wspeed,
            rainfall: x.rainfall,
            cover: x.cover,
          })),
        )
      }
    }
  }, [dispatch, municipality, tendayweather, tenStatus, pageInitialized])

  const handleItemChange = async (e, newValue) => {
    const { label, from } = newValue

    if (label) {
      switch (from) {
        case 'province':
          dispatch(provinceReceived(newValue))
          dispatch(fetchTendayWeather(label))
          dispatch(municipalitiesReceived([]))
          break
        case 'municipality':
          dispatch(
            municipalityReceived({
              id: newValue.id,
              label: newValue.label,
              iscalendar: newValue.iscalendar,
            }),
          )
          break
        default:
          break
      }
    } else {
      switch (from) {
        case 'province':
          dispatch(provinceReset())
          dispatch(municipalitiesReceived([]))
          setMunicipalWeather([])
          break
        case 'municipality':
          dispatch(municipalityReceived(null))
          setMunicipalWeather([])
          break
        default:
          break
      }
    }
  }

  return (
    <TenDayForecast
      weather={municipalWeather}
      onSelectItemChange={handleItemChange}
    />
  )
}

export default TenDayForecastContainer
