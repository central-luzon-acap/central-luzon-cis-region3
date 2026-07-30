import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Services
import { getProvincesMunicipalities } from '@/services/region'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { previewBulletin } from '@/services/report'

// Hooks
import { useNestedCollection } from '@/hooks/usefirestore'

// Redux
import { reportTypeReceived } from '@/store/dashboard/dashboardSlice'
import { reportReset } from '@/store/reports/reportSlice'
import { createSeasonalReport } from '@/store/reports/reportThunks'
import { fetchReports } from '@/store/reports/reportThunks'

// Utilities
import { formatSelectOptions } from '@/utils/formatters'
import { parseBlobErrorResponse } from '@/utils/common'
import getClimateRisk from '@/utils/get_climate_risk'

// Hooks
import useFetchCroppingCalendarV2 from '@/hooks/cropping_calendar/usefetchcroppingcalendarv2'
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'
// import useCroppingCalendar from '@/hooks/cropping_calendar/usecroppingcalendar'
import useFetchRecommendations from '@/hooks/recommendationsv2/usefetchrecommendations'
import useFetchRecommendationsSMS from '@/hooks/recommendationsv2/usefetchrecommendationsSMS'
import useRecommendationsImpacts from '@/hooks/recommendations/userecommendationsimpacts'
import useSeasonalForecast from '@/hooks/weather_forecast/useseasonalforecast'
import useRecommendations from '@/hooks/recommendations/userecommendationsv2'
import useSupportServices from '@/hooks/support_services/usesupportservices'

// Constants
import { ADAPTER_STATES } from '@/store/constants'

import {
  WEATHER_CONDITION_LABELS,
  MONTH_LABELS,
  ACCOUNT_LEVEL
} from '@/utils/constants'
import { REPORT_TYPE, DEFAULT_REPORT_DIALOGS } from '@/utils/constants/app'
import withAuthListener from '@/common/entities/withauth'
import CreateCropsBulletinsV2Component from '@/domain/admin/bulletins/seasonal/create'
import ProtectedPage from '@/common/layout/protectedpage'
// import { smsWriter, REPLACE_KEYS, SMS_TYPE, MONTHS_TAGALOG } from '@/utils/sms-writer'

const defaultSelected = {
  sel_province: null,
  sel_crop: null,
  sel_stage: null,
  sel_activity: [],
  sel_month: null,
  sel_condition: {
    id: 0,
    from: 'weather_condition',
    label: WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label
  },
  loading: false,
  error: '',
  success: ''
}

const defaultBulletin = { url: '', filename: '' }

function CreateCropsBulletins({ user, onBtnLogoutClick, loading }) {
  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)

  const [climateRisk, setClimateRisk] = useState({})

  // Seasonal weather forecast for the selected province
  const [provinceForecast, setWeatherForecast] = useState({})

  // Default formatted (6) seasonal months list
  const [defaultMonths, setDefaultMonths] = useState([])

  // Active recommendation
  const [recommendations, setRecommendations] = useState([])

  // Province list
  const [optsprovinces, setOptsProvinces] = useState([])

  // Raw provinces list
  const [provinces, setProvinces] = useState([])

  // Crop stages list of a municipality
  const [optscropstages, setOptsCropStage] = useState(null)

  // Flags
  const [isLoading, setIsLoading] = useState(true)
  const [isTagalog, setIsTagalog] = useState(false)
  const mounted = useRef(false)

  // Dynamic computed/process data using hooks

  // Seasonal weather forecast
  const {
    documents: forecastSeasonal,
    loading: fsLoading
    // error: errSeasonal
  } = useNestedCollection(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    process.env.REGION_NAME,
    _WeatherForecastGetter.SUB_SEASONAL,
    'name'
  )

  // Set the selected month's seasonal weather forecast for a province
  const { forecast: monthForecast } = useSeasonalForecast(
    provinceForecast,
    sel_options.sel_month
  )

  // Raw provincial-level cropping calendar data
  // const {
  //   cropcalendar: calendarData,
  //   loading: loadingCal,
  //   error: errCalData
  // } = useFetchCroppingCalendar(sel_options.sel_province)

  const {
    cropcalendar: calendarData2,
    cropStages,
    loading: loadingCal
  } = useFetchCroppingCalendarV2(
    'seasonal',
    sel_options.sel_province,
    sel_options.sel_crop
  )

  const {
    recommendationsSMS: recommendationsSMSData,
    loading: loadingRecsSMS
  } = useFetchRecommendationsSMS(
    sel_options.sel_crop,
    climateRisk.code,
    'seasonal_sms'
  )

  useEffect(() => {
    // Set the SMS text content
    if (recommendationsSMSData?.length !== 0) {
      setSmsText(
        recommendationsSMSData[0].sms.replace(
          '{{seasonal_range_identifier}}',
          sel_options?.sel_month?.label
        )
      )
    }
  }, [recommendationsSMSData, sel_options.sel_month])

  useEffect(() => {
    if (
      calendarData2.length !== 0 &&
      !isLoading &&
      defaultMonths.length !== 0 &&
      sel_options.sel_crop === calendarData2.data1[0].crop
    ) {
      const _cropStageLabels = []

      defaultMonths.forEach((month) => {
        if (calendarData2.length === 0) return

        // First half Month
        const cropStageData1 = calendarData2.data1[0][month.id]?.split(',')

        if (cropStageData1 && cropStageData1?.length === 2) {
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
        }

        // Second half Month
        const cropStageData2 = calendarData2.data2[0][month.id]?.split(',')

        if (cropStageData2 && cropStageData2?.length === 2) {
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
        }
      })

      const _cropStages = _cropStageLabels.map((cropStageCode, index) => {
        return {
          id: index,
          label: cropStages[cropStageCode].label,
          code: cropStageCode
        }
      })

      setOptsCropStage(_cropStages)
    }
  }, [
    calendarData2,
    isLoading,
    sel_options.sel_crop,
    defaultMonths,
    cropStages
  ])

  // Crops list of a municipality
  // const optscrops = useCrops(calendarData, sel_options.sel_municipality)
  const { cropList } = useFetchCrops()
  const parsedCropList = cropList.map((crop, index) => {
    return {
      disabled: false,
      label: crop,
      id: index
    }
  })

  // Fetches crop stages for all municipalities in a province
  // Enable or disable the months list selection
  // const {
  //   months: optsmonths,
  //   uniquecropstages,
  //   // error: errCalendar,
  // } = useCroppingCalendar(municipalcalendarData, defaultMonths, sel_options.sel_crop)

  // Recommendations data reference and farm operations options
  const {
    recommendations: recommendationsData,
    farmoperations: optsactivities,
    loading: loadingRecs
    // error: errRecommendations
  } = useFetchRecommendations(
    climateRisk.code,
    optscropstages,
    sel_options.sel_crop,
    'seasonal',
    true
  )

  // const {
  //   recommendations: recommendationsData,
  //   farmoperations: optsactivities,
  //   loading: loadingRecs,
  //   // error: errRecommendations
  //  } = useFetchRecommendations(optscropstages, monthForecast, RECOMMENDATION_TYPE.SEASONAL, true)

  // Group the recommendations by crop stages and farm operations
  const {
    group: recommendationsGroup
    // error: recsGroupError
  } = useRecommendations(recommendationsData, cropStages, optscropstages)

  const {
    group: recommendationsImpacts
    // error: impactsError
  } = useRecommendationsImpacts(recommendationsData, optsactivities)

  const { services, loading: isLoadingSupportServices } = useSupportServices(
    undefined,
    undefined
  )

  // ------ OLD ------

  const [pdfPreview, setPdfPreview] = useState(defaultBulletin)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(DEFAULT_REPORT_DIALOGS)
  const [smsText, setSmsText] = useState('')

  const reportType = useSelector((state) => state.dashboard.reportType)
  const dispatch = useDispatch()

  const {
    report,
    status: reportLoading
    // error: errReport
  } = useSelector((state) => state.reports)

  useEffect(() => {
    if (provinceForecast?.months?.length > 0 && sel_options.sel_crop !== null) {
      setClimateRisk(getClimateRisk(provinceForecast.months, 'seasonal'))
      const _label = `${
        MONTH_LABELS[provinceForecast.mos[0].toUpperCase()].format
      } - ${MONTH_LABELS[provinceForecast.mos[5].toUpperCase()].format}`
      setSelOptions((prev) => ({ ...prev, sel_month: { label: _label } }))
    }
  }, [provinceForecast, sel_options.sel_crop])

  useEffect(() => {
    mounted.current = true

    // TO-DO: Use hooks
    const loadProvinces = async () => {
      try {
        const provinces = await getProvincesMunicipalities()

        if (mounted) {
          setProvinces(provinces.data)
        }
      } catch (error) {
        // console.error(error.message)
      }
    }

    loadProvinces()

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    dispatch(reportReset())
  }, [dispatch])

  // Preload page-persistent data
  useEffect(() => {
    if (provinces.length > 0 && !fsLoading && !loading) {
      // Set the static province list selection options
      setOptsProvinces(formatSelectOptions(provinces))

      // Set the default constant selectable months options max (6) seasonal months list
      setDefaultMonths(
        forecastSeasonal[0].mos.reduce(
          (list, month) => [
            ...list,
            {
              id: MONTH_LABELS[month.toUpperCase()].code,
              label: MONTH_LABELS[month.toUpperCase()].format,
              disabled: false
            }
          ],
          []
        )
      )
    }
  }, [provinces, forecastSeasonal, fsLoading, loading])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(
      loading ||
        fsLoading ||
        loadingRecs ||
        loadingCal ||
        loadingRecsSMS ||
        isLoadingSupportServices
    )
  }, [
    loading,
    fsLoading,
    loadingRecs,
    loadingCal,
    loadingRecsSMS,
    isLoadingSupportServices
  ])

  // useEffect(() => {
  //   // Watch data loading & hooks errors
  //   if (errCalendar !== '' || errRecommendations !== '' || errSeasonal !== '' || errCalData !== '' || recsGroupError !== '' || errReport !== '' || impactsError !== '') {
  //     const errMsg = errCalendar || errRecommendations || errSeasonal || errCalData || recsGroupError || errReport || impactsError
  //     setSelOptions(prev => ({ ...prev, error: errMsg }))
  //   } else {
  //     setSelOptions(prev => ({ ...prev, error: '' }))
  //   }
  // }, [errCalendar, errRecommendations, errSeasonal, errCalData, recsGroupError, errReport, impactsError])

  useEffect(() => {
    if (reportLoading === ADAPTER_STATES.FULLFILLED && report !== null) {
      if (mounted.current) {
        setMessage((prev) => ({
          ...prev,
          msg: 'Success! Bulletin report created.',
          loading: false,
          savesuccess: true,
          docId: report.id
        }))
      }
    }
  }, [reportLoading, report])

  /**
   * Dropdown menus selection handler.
   * Set a menu's selected value and clear/display appropriate values on dependent menus.
   * @param {Event} e - HTML Event
   * @param {Object} newValue - selected option value { id, label, from }
   */
  const onSelectItemChange = (e, newValue) => {
    const { from, label } = newValue

    // Reset options selections
    setPdfPreview(defaultBulletin)

    if (recommendations.length > 0) {
      setRecommendations([])
    }

    if (Object.keys(newValue).includes('id')) {
      switch (from) {
        case 'province':
          setOptsCropStage(null)

          // Set weather forecast for the selected province
          setWeatherForecast(
            forecastSeasonal.find((forecast) => forecast.name === label)
          )

          // Set the selected province
          setSelOptions({ ...defaultSelected, sel_province: label })
          break
        case 'crop':
          setSelOptions({
            ...sel_options,
            sel_crop: label,
            sel_month: null,
            sel_stage: null,
            sel_activity: null
          })
          setOptsCropStage(null)
          setRecommendations([])
          break
        default:
          break
      }
    } else {
      // Input cleared
      if (from === 'province') {
        setSelOptions(defaultSelected)
        setOptsCropStage(null)
      } else if (from === 'crop') {
        setSelOptions({
          ...sel_options,
          sel_crop: null,
          sel_month: null,
          sel_stage: null,
          sel_activity: null
        })
        setOptsCropStage(null)
      } else if (from === 'month') {
        setSelOptions({
          ...sel_options,
          sel_month: null,
          sel_stage: null,
          sel_activity: null
        })
        setOptsCropStage(null)
      }
    }
  }

  const resetSelections = () => {
    setSelOptions(defaultSelected)
    setOptsCropStage(null)
    setRecommendations([])
  }

  // Save the report and upload the PDF to storage
  const handleSave = async () => {
    setMessage({ ...message, loading: true, msg: 'Saving report...' })
    try {
      const body = {
        region: process.env.REGION_NAME,
        province: sel_options.sel_province,
        crop: sel_options.sel_crop,
        climateRisk,
        cropping_calendar: calendarData2,
        stages: optscropstages,
        activities: optsactivities.map((activity) => activity.label),
        recommendations: recommendationsData,
        services: services.map((service) => service.data),
        operation: 'create',
        language: isTagalog ? 'tag' : 'en',
        isFull: true
      }

      dispatch(createSeasonalReport(body))
        .unwrap()
        .then(() => {
          // Load the seasonal reports list if its not yet loaded
          if (reportType !== REPORT_TYPE.SEASONAL) {
            dispatch(reportTypeReceived(REPORT_TYPE.SEASONAL))
            dispatch(
              fetchReports({
                uid: user.uid,
                type: REPORT_TYPE.SEASONAL
              })
            )
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setMessage((prev) => ({
              ...prev,
              msg: error.message,
              loading: false,
              savesuccess: false,
              docId: null
            }))
          }
        })
    } catch (err) {
      let errMsg = ''

      if (err.response !== undefined) {
        errMsg =
          err.response.data !== undefined &&
          typeof err.response.data === '[object Blob]'
            ? err.response.data
            : ''
      }

      if (errMsg === '') {
        errMsg = err.message
      }
    }
  }

  const handlePreview = async () => {
    // Display PDF blob from cache
    if (pdfPreview.url !== '') {
      setOpen(true)
      return
    }

    setSelOptions((prev) => ({
      ...prev,
      loading: true,
      error: '',
      success: ''
    }))

    try {
      const body = {
        region: process.env.REGION_NAME,
        province: sel_options.sel_province,
        crop: sel_options.sel_crop,
        operation: 'preview',
        climateRisk,
        cropping_calendar: calendarData2,
        stages: optscropstages ?? [],
        activities: optsactivities.map((activity) => activity.label),
        recommendations: recommendationsData,
        services: services.map((service) => service.data),
        language: isTagalog ? 'tag' : 'en',
        isFull: true
      }

      setOpen(true)
      setSelOptions((prev) => ({ ...prev, loading: true, error: '' }))
      const response = await previewBulletin(body)

      const blob = new Blob([response], { type: 'application/pdf' })
      const link = {}

      link.href = URL.createObjectURL(blob)
      link.download = `${sel_options.sel_province}-${sel_options.sel_crop}.pdf`

      setPdfPreview((prev) => ({
        ...prev,
        url: link.href,
        filename: link.download
      }))
      setSelOptions((prev) => ({
        ...prev,
        loading: false,
        success: 'Bulletin preview created.'
      }))
    } catch (err) {
      const errorResponse = await parseBlobErrorResponse(err)
      setSelOptions((prev) => ({
        ...prev,
        loading: false,
        error: errorResponse
      }))
    }
  }

  const toggleViewerOpen = () => {
    setOpen((prev) => !prev)
  }

  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <CreateCropsBulletinsV2Component
        climateRisk={climateRisk.label}
        optsprovinces={optsprovinces}
        optscrops={parsedCropList}
        optsmonths={defaultMonths}
        optscropstages={optscropstages}
        optsactivities={optsactivities}
        sel_options={sel_options}
        monthForecast={monthForecast}
        recommendations={recommendationsGroup}
        recommendationsImpacts={recommendationsImpacts}
        loading={isLoading}
        isloadingreport={reportLoading === ADAPTER_STATES.PENDING}
        open={open}
        isTagalog={isTagalog}
        message={message}
        smstext={smsText}
        pdfPreview={pdfPreview}
        onSelectItemChange={onSelectItemChange}
        handlePreview={handlePreview}
        handleSave={handleSave}
        toggleViewerOpen={toggleViewerOpen}
        toggleGlobalLanguage={() => {
          setIsTagalog((prev) => !prev)
          setPdfPreview(defaultBulletin)
        }}
        resetSelections={resetSelections}
        togglePrompt={() => {
          setMessage((prev) => ({
            ...DEFAULT_REPORT_DIALOGS,
            isOpen: !prev.isOpen
          }))
        }}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(CreateCropsBulletins)
