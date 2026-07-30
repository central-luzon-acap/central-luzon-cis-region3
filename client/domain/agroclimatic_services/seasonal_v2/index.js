import { useEffect, useState, useRef } from 'react'
import { WEATHER_CONDITION_LABELS, MONTH_LABELS } from '@/utils/constants'
import { formatSelectOptions } from '@/utils/formatters'
import SeasonalRecommendationsV2Component from './seasonal'

import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import useFetchCroppingCalendarV2 from '@/hooks/cropping_calendar/usefetchcroppingcalendarv2'
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'
import useFetchRecommendations from '@/hooks/recommendationsv2/usefetchrecommendations'
import { useNestedCollection } from '@/hooks/usefirestore'
import getClimateRisk from '@/utils/get_climate_risk'

const defaultSelected = {
  sel_province: null,
  sel_crop: null,
  sel_stage: null,
  sel_activity: null,
  sel_condition: {
    id: 0,
    from: 'weather_condition',
    label: WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label,
  },
  loading: false,
  error: '',
}

function SeasonalRecommendationsV2({ provinces = [] }) {
  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)

  const [seasonalMonths, setSeasonalMonths] = useState([])

  const [climateRisk, setClimateRisk] = useState({})

  // Active recommendation
  const [recommendations, setRecommendations] = useState([])

  // Province list
  const [optsprovinces, setOptsProvinces] = useState([])

  // Crop stages list of a municipality
  const [optscropstages, setOptsCropStage] = useState([])

  // Flags
  const [isLoading, setIsLoading] = useState(true)
  const mounted = useRef(false)

  const { cropList } = useFetchCrops()
  const parsedCropList = cropList.map((crop, index) => {
    return {
      disabled: false,
      label: crop,
      id: index,
    }
  })

  // Dynamic computed/process data using hooks

  // Seasonal weather forecast
  const {
    documents: forecastSeasonal,
    loading: fsLoading,
    // error: errSeasonal
  } = useNestedCollection(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    process.env.REGION_NAME,
    _WeatherForecastGetter.SUB_SEASONAL,
    'name',
  )

  const {
    cropcalendar: calendarData2,
    cropStages,
    loading: loadingCal,
  } = useFetchCroppingCalendarV2(
    'seasonal',
    sel_options.sel_province,
    sel_options.sel_crop,
  )

  // Recommendations data reference and farm operations options
  const {
    recommendations: recommendationsData,
    farmoperations: optsactivities,
    loading: loadingRecs,
    // error: errRecommendations
  } = useFetchRecommendations(
    climateRisk.code,
    sel_options.sel_stage?.code ?? null,
    sel_options.sel_crop,
    'seasonal',
  )

  useEffect(() => {
    if (
      calendarData2.length !== 0 &&
      !isLoading &&
      seasonalMonths.length !== 0
    ) {
      const _cropStageLabels = []
      seasonalMonths.forEach((month) => {
        if (calendarData2.length === 0) return

        // First half Month
        const cropStageData1 = calendarData2.data1[0][month.id].split(',')
        if (
          cropStageData1[0] !== 'none' &&
          !_cropStageLabels.includes(cropStageData1[0])
        ) {
          _cropStageLabels.push(cropStageData1[0])
        }

        if (
          cropStageData1[1] !== 'none' &&
          !_cropStageLabels.includes(cropStageData1[1])
        ) {
          _cropStageLabels.push(cropStageData1[1])
        }

        // Second half Month
        const cropStageData2 = calendarData2.data2[0][month.id].split(',')
        if (
          cropStageData2[0] !== 'none' &&
          !_cropStageLabels.includes(cropStageData2[0])
        ) {
          _cropStageLabels.push(cropStageData2[0])
        }

        if (
          cropStageData2[1] !== 'none' &&
          !_cropStageLabels.includes(cropStageData2[1])
        ) {
          _cropStageLabels.push(cropStageData2[1])
        }
      })

      const _cropStages = _cropStageLabels.map((cropStageCode, index) => {
        return {
          id: index,
          label: cropStages[cropStageCode].label,
          code: cropStageCode,
        }
      })
      setOptsCropStage(_cropStages)
    }
  }, [
    calendarData2,
    isLoading,
    sel_options.sel_crop,
    seasonalMonths,
    cropStages,
  ])

  useEffect(() => {
    if (calendarData2.length === 0 && recommendationsData.length) {
      setRecommendations(recommendationsData)
    }
  }, [calendarData2, recommendationsData])

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  // Preload page-persistent data
  useEffect(() => {
    if (provinces.length > 0 && forecastSeasonal.length > 0 && !fsLoading) {
      // Set the static province list selection options
      setOptsProvinces(formatSelectOptions(provinces))
      // Set the default constant selectable months options max (6) seasonal months list
      const _data = forecastSeasonal[0].mos.reduce((list, month) => {
        list.push({
          id: MONTH_LABELS[month.toUpperCase()].code,
          label: MONTH_LABELS[month.toUpperCase()].format,
          disabled: false,
        })

        return list
      }, [])
      setSeasonalMonths(_data)
    }
  }, [provinces, forecastSeasonal, fsLoading])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(fsLoading || loadingRecs || loadingCal)
  }, [fsLoading, loadingRecs, loadingCal])

  // useEffect(() => {
  //   // Watch data loading errors
  //   if (errCalendar !== '' || errRecommendations !== '' || errSeasonal !== '' || errCalData !== '') {
  //     const errMsg = errCalendar || errRecommendations || errSeasonal || errCalData
  //     setSelOptions(prev => ({ ...prev, error: errMsg }))
  //   } else {
  //     setSelOptions(prev => ({ ...prev, error: '' }))
  //   }
  // }, [errCalendar, errCalData, errRecommendations, errSeasonal])

  /**
   * Dropdown menus selection handler.
   * Set a menu's selected value and clear/display appropriate values on dependent menus.
   * @param {Event} e - HTML Event
   * @param {Object} newValue - selected option value { id, label, from }
   */
  const onSelectItemChange = (e, newValue) => {
    const { from, label } = newValue

    if (recommendations.length > 0) {
      setRecommendations([])
    }

    if (Object.keys(newValue).includes('id')) {
      switch (from) {
        case 'province':
          setOptsCropStage([])

          // Set weather forecast for the selected province
          const _data = forecastSeasonal.find(
            (forecast) => forecast.name === label,
          )
          setClimateRisk(getClimateRisk(_data.months, 'seasonal'))

          // Set the selected province
          setSelOptions({ ...defaultSelected, sel_province: label })
          break
        case 'crop':
          // Set the sub (municipality) cropping calendar
          // setMunicipalCropCal(calendarData.find(rec =>
          //   rec.municipality === sel_options.sel_municipality &&
          //   rec.crop === label))
          setSelOptions({
            ...sel_options,
            sel_crop: label,
            sel_stage: null,
            sel_activity: null,
          })

          break
        case 'cropstage':
          // Set the selected crop stage
          setSelOptions({
            ...sel_options,
            sel_stage: newValue,
            sel_activity: null,
          })
          break
        case 'activity':
          // Set the recommendations
          const _recs = recommendationsData.filter(
            (rec) =>
              rec.crop_stage === sel_options.sel_stage.code &&
              rec.farming_activity === label,
          )

          setRecommendations(_recs)

          setSelOptions({ ...sel_options, sel_activity: label })
          break
        default:
          break
      }
    } else {
      // Input cleared
      if (from === 'province') {
        setSelOptions(defaultSelected)
        setOptsCropStage([])
      } else if (from === 'crop') {
        setSelOptions({
          ...sel_options,
          sel_crop: null,
          sel_stage: null,
          sel_activity: null,
        })
        setOptsCropStage([])
      } else if (from === 'cropstage') {
        setSelOptions({ ...sel_options, sel_stage: null, sel_activity: null })
      } else if (from === 'activity') {
        setSelOptions({ ...sel_options, sel_activity: null })
      }
    }
  }

  return (
    <SeasonalRecommendationsV2Component
      croppingCalendar={calendarData2}
      climateRisk={climateRisk.label}
      optsprovinces={optsprovinces}
      optscrops={parsedCropList}
      optsmonths={seasonalMonths}
      optscropstages={optscropstages}
      optsactivities={optsactivities}
      sel_options={sel_options}
      recommendations={recommendations}
      loading={isLoading}
      seasonalMonths={seasonalMonths}
      onSelectItemChange={onSelectItemChange}
      onResetClick={() => {
        setSelOptions(defaultSelected)
        setOptsCropStage([])
        setRecommendations([])
      }}
    />
  )
}

export default SeasonalRecommendationsV2
