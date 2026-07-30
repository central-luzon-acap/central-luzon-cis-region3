import { useEffect, useState, useRef } from 'react'
import { formatSelectOptions } from '@/utils/formatters'
import TendayRecommendationsV2Component from './tenday'

import useFetchCroppingCalendarV2 from '@/hooks/cropping_calendar/usefetchcroppingcalendarv2'
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'
import useFetchRecommendations from '@/hooks/recommendationsv2/usefetchrecommendations'
import useMunicipalities from '@/hooks/municipalities/usemunicipalities'
import useTendayForecast from '@/hooks/weather_forecast/usetendayforecast'
import { getRangedMonths } from '@/utils/date'
import getClimateRisk from '@/utils/get_climate_risk'

const defaultWeatherCondition = {
  id: 0,
  from: 'weather_condition',
  label: null,
  date: new Date().toDateString(),
}

const defaultSelected = {
  sel_province: null,
  sel_municipality: null,
  sel_crop: null,
  sel_stage: null,
  sel_activity: null,
  sel_month: null,
  sel_day: null,
  sel_condition: defaultWeatherCondition,
  loading: false,
  error: '',
  warning: '',
}

function TendayRecommendationsV2({ provinces = [] }) {
  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)

  const [climateRisk, setClimateRisk] = useState({})

  // Active recommendation
  const [recommendations, setRecommendations] = useState([])

  // Active/selected date's weather forecast
  const [weathertoday, setWeatherToday] = useState(null)

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

  // Dynamic computed/processed data using hooks

  // Mnicipalities list of a province
  const optsmunicipalities = useMunicipalities(
    sel_options.sel_province,
    provinces,
  )

  // Raw provincial-level cropping calendar data
  // const {
  //   cropcalendar: calendarData,
  //   loading,
  //   // error: errCalData
  // } = useFetchCroppingCalendar(sel_options.sel_province)

  // Crops list of a municipality
  // const cropsListData = useCrops(calendarData, sel_options.sel_municipality)

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
    'tenday',
  )

  // Fetches crop stages for all municipalities in a province
  // Enable or disable the crops list selection
  // const {
  //   cropslist: optscrops,
  //   cropstagesbycrop: cropStageData,
  //   error: errCalendar
  // } = useCroppingCalendarTenday(municipalcalendarData, sel_options.sel_day?.full, cropsListData)

  const {
    cropcalendar: calendarData2,
    cropStages,
    loading: loadingCal,
  } = useFetchCroppingCalendarV2(
    '10-day',
    sel_options.sel_province,
    sel_options.sel_crop,
  )

  // Fetch and process the 10-Day weather forecast for the selected province and municipality
  const {
    days: optsdays,
    loading: tenLoading,
    // error: tendayForecastError,
    warning,
    // summary: tendayForecastSummary,
  } = useTendayForecast(sel_options.sel_province, sel_options.sel_municipality)

  useEffect(() => {
    if (optsdays.length > 0) {
      setClimateRisk(getClimateRisk(optsdays, 'tenday'))
    }
  }, [optsdays])

  useEffect(() => {
    if (optsdays.length > 0 && !loadingCal && !loadingRecs) {
      const dateRangeStart = new Date(optsdays[0].label_full)
      const months = getRangedMonths(dateRangeStart)

      if (calendarData2.length !== 0) {
        const municipalCalendar1 = calendarData2.data1.find(
          (_municipalCalendar) =>
            _municipalCalendar.municipality === sel_options.sel_municipality &&
            _municipalCalendar.crop === sel_options.sel_crop,
        )

        const municipalCalendar2 = calendarData2.data2.find(
          (_municipalCalendar) =>
            _municipalCalendar.municipality === sel_options.sel_municipality &&
            _municipalCalendar.crop === sel_options.sel_crop,
        )

        const _cropStagesLabel = []
        if (
          municipalCalendar1 &&
          municipalCalendar2 &&
          Object.keys(cropStages).length > 0
        ) {
          Object.keys(months).forEach((month) => {
            const monthCropStage1 = municipalCalendar1[month].split(',')
            // For cases of may: ['1st_half', '2nd_half']
            months[month].forEach((half) => {
              if (half === '1st_half' && monthCropStage1[0] !== 'none') {
                if (!_cropStagesLabel.includes(monthCropStage1[0])) {
                  _cropStagesLabel.push(monthCropStage1[0])
                }
              } else if (half === '2nd_half' && monthCropStage1[1] !== 'none') {
                if (!_cropStagesLabel.includes(monthCropStage1[1])) {
                  _cropStagesLabel.push(monthCropStage1[1])
                }
              }
            })

            const monthCropStage2 = municipalCalendar2[month].split(',')
            // For cases of may: ['1st_half', '2nd_half']
            months[month].forEach((half) => {
              if (half === '1st_half' && monthCropStage2[0] !== 'none') {
                if (!_cropStagesLabel.includes(monthCropStage2[0])) {
                  _cropStagesLabel.push(monthCropStage2[0])
                }
              } else if (half === '2nd_half' && monthCropStage2[1] !== 'none') {
                if (!_cropStagesLabel.includes(monthCropStage2[1])) {
                  _cropStagesLabel.push(monthCropStage2[1])
                }
              }
            })
          })

          const _cropStages = _cropStagesLabel.map((code, index) => {
            return {
              id: index,
              label: cropStages[code].label,
              code: code,
            }
          })

          setOptsCropStage(_cropStages)
        }
      }
    }
  }, [
    cropStages,
    calendarData2.length,
    calendarData2.data1,
    calendarData2.data2,
    optsdays,
    sel_options.sel_municipality,
    sel_options.sel_crop,
    loadingCal,
    loadingRecs,
  ])

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  // Preload page-persistent data
  useEffect(() => {
    if (provinces.length > 0) {
      // Set the static province list selection options
      setOptsProvinces(formatSelectOptions(provinces))
    }
  }, [provinces])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(tenLoading || loadingRecs || loadingCal)
  }, [tenLoading, loadingRecs, loadingCal])

  // useEffect(() => {
  //   // Watch data loading errors
  //   if (errCalendar !== '' || errRecommendations !== '' || tendayForecastError !== '' || errCalData !== '') {
  //     const errMsg = errCalendar || errRecommendations || tendayForecastError || errCalData
  //     setSelOptions(prev => ({ ...prev, error: errMsg }))
  //   } else {
  //     setSelOptions(prev => ({ ...prev, error: '' }))
  //   }
  // }, [errCalendar, errCalData, errRecommendations, tendayForecastError])

  const onClickDateSelector = (value) => {
    let partialDate = new Date(value).toDateString()
    partialDate = partialDate.substring(0, partialDate.length - 5)

    onSelectItemChange(null, {
      id: partialDate,
      label: partialDate,
      full: new Date(value),
      from: 'day',
    })
  }

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

          // Reset the weather summary data
          setWeatherToday(null)

          // Set the selected province
          setSelOptions({ ...defaultSelected, sel_province: label })
          break
        case 'municipality':
          setOptsCropStage([])

          // Set the selected municipality
          setSelOptions({
            ...sel_options,
            sel_municipality: label,
            sel_crop: null,
            sel_day: null,
            sel_month: null,
            sel_stage: null,
            sel_activity: null,
          })
          break
        case 'day':
          setOptsCropStage([])
          setWeatherToday(optsdays.find((day) => day.label === label))

          // Set the selected date
          setSelOptions({
            ...sel_options,
            sel_day: newValue,
            sel_month: null,
            sel_crop: null,
            sel_stage: null,
            sel_activity: null,
          })
          break
        case 'crop':
          setOptsCropStage([])
          setSelOptions({
            ...sel_options,
            sel_crop: label,
            sel_month: null,
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
          // Select the recommendation
          setRecommendations(
            recommendationsData.filter(
              (rec) =>
                rec.crop_stage === sel_options.sel_stage.code &&
                rec.farming_activity === label,
            ),
          )

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
      } else if (from === 'municipality') {
        setSelOptions({
          ...sel_options,
          sel_municipality: null,
          sel_crop: null,
          sel_day: null,
          sel_month: null,
          sel_stage: null,
          sel_activity: null,
        })
        setOptsCropStage([])
      } else if (from === 'day') {
        setSelOptions({
          ...sel_options,
          sel_day: null,
          sel_crop: null,
          sel_month: null,
          sel_stage: null,
          sel_activity: null,
        })
        setOptsCropStage([])
      } else if (from === 'crop') {
        setSelOptions({
          ...sel_options,
          sel_crop: null,
          sel_month: null,
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
    <TendayRecommendationsV2Component
      climateRisk={climateRisk.label}
      optsprovinces={optsprovinces}
      optsmunicipalities={optsmunicipalities}
      optscrops={parsedCropList}
      optsdays={optsdays}
      optscropstages={optscropstages}
      optsactivities={optsactivities}
      sel_options={sel_options}
      recommendations={recommendations}
      weathertoday={weathertoday}
      loading={isLoading}
      warning={warning}
      onSelectItemChange={onSelectItemChange}
      onClickDateSelector={onClickDateSelector}
      onResetClick={() => {
        setSelOptions(defaultSelected)
        setOptsCropStage([])
        setRecommendations([])
      }}
    />
  )
}

export default TendayRecommendationsV2
