import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CommonCreateReportComponent from '@/domain/admin/bulletins/commoncreate'
import ProtectedPage from '@/common/layout/protectedpage'
import withAuthListener from '@/common/entities/withauth'
//
// Services
import { getProvincesMunicipalities } from '@/services/region'
import { createTenDReport } from '@/store/reports/reportThunks'
import { fetchReports } from '@/store/reports/reportThunks'
import { previewBulletinTenday } from '@/services/report'
import { filteredRecommendationReceived } from '@/store/recommendations/recommendationSlice'
import { ADAPTER_STATES } from '@/store/constants'

// Hooks
import useFetchCroppingCalendarV2 from '@/hooks/cropping_calendar/usefetchcroppingcalendarv2'
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'
import useFetchRecommendations from '@/hooks/recommendationsv2/usefetchrecommendations'
import useFetchRecommendationsSMS from '@/hooks/recommendationsv2/usefetchrecommendationsSMS'
import useMunicipalities from '@/hooks/municipalities/usemunicipalities'
import useRecommendations from '@/hooks/recommendations/userecommendationsv2'
import useTendayForecast from '@/hooks/weather_forecast/usetendayforecast'
import useSupportServices from '@/hooks/support_services/usesupportservices'

// Constants
import { REPORT_TYPE, DEFAULT_REPORT_DIALOGS } from '@/utils/constants/app'
import { formatSelectOptions } from '@/utils/formatters'
import { getRangedMonths } from '@/utils/date'
import { ACCOUNT_LEVEL, WEATHER_CONDITION_LABELS } from '@/utils/constants'

// Utilities
import { reportTypeReceived } from '@/store/dashboard/dashboardSlice'
import { reportReset } from '@/store/reports/reportSlice'
import { parseBlobErrorResponse } from '@/utils/common'
import getClimateRisk from '@/utils/get_climate_risk'

const defaultSelected = {
  sel_province: null,
  sel_municipality: null,
  sel_crop: null,
  sel_stage: null,
  sel_activity: [],
  sel_month: null,
  processed: false,
  loading: false,
  error: '',
  success: '',
  sel_condition: {
    id: 0,
    from: 'weather_condition',
    label: WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label
  }
}

const defaultBulletin = { url: '', filename: '' }

// Note: This page only needs to display "all" applicable options that meet the conditions
// unlike its public-viewing counterpart which also needs to display the "not-applicable" options for show
function CreateTendayBulletinV2({ user, onBtnLogoutClick, loading }) {
  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)

  const [climateRisk, setClimateRisk] = useState({})

  const [climateRiskSMS, setClimateRiskSMS] = useState({})

  // Active recommendation
  const [recommendations, setRecommendations] = useState([])

  // Province list
  const [optsprovinces, setOptsProvinces] = useState([])

  // Raw provinces list
  const [provinces, setProvinces] = useState([])

  // Crop stages list of a municipality
  // TO-DO: Do not use as string then array
  const [optscropstages, setOptsCropStage] = useState([])

  // Dynamic computed/processed data using hooks

  // Mnicipalities list of a province
  const optsmunicipalities = useMunicipalities(
    sel_options.sel_province,
    provinces
  )

  // Fetch and process the 10-Day weather forecast for the selected province and municipality
  const {
    days: optsdays,
    loading: tenLoading,
    // error: tendayForecastError,
    summary: tendayForecastSummary
  } = useTendayForecast(sel_options.sel_province, sel_options.sel_municipality)

  useEffect(() => {
    if (optsdays.length > 0) {
      const riskRecoms = getClimateRisk(optsdays, 'tenday')
      const riskSMS = { ...riskRecoms }

      // Merge these climate risks only for 10-day "recommendations"
      if (
        ['Flooding/Submergence 3M', 'Flooding/Submergence 2H'].includes(
          riskSMS.label
        )
      ) {
        riskRecoms.label = 'Flooding/Submergence'
        riskRecoms.code = 'flood_submergence'
      }

      setClimateRisk(riskRecoms)
      setClimateRiskSMS(riskSMS)
    }
  }, [optsdays])

  const {
    cropcalendar: calendarData2,
    cropStages,
    loading: loadingCal
  } = useFetchCroppingCalendarV2(
    '10-day',
    sel_options.sel_province,
    sel_options.sel_crop
  )

  const { cropList } = useFetchCrops()
  const parsedCropList = cropList.map((crop, index) => {
    return {
      disabled: false,
      label: crop,
      id: index
    }
  })

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
    'tenday',
    true
  )

  const {
    recommendationsSMS: recommendationsSMSData,
    loading: loadingRecsSMS
  } = useFetchRecommendationsSMS(
    sel_options.sel_crop,
    climateRiskSMS.code,
    'tenday_sms'
  )

  // Group the recommendations by crop stages and farm operations
  const { group: recommendationsGroup, error: recsGroupError } =
    useRecommendations(recommendationsData, cropStages, optscropstages)

  const { services, loading: isLoadingSupportServices } = useSupportServices(
    undefined,
    undefined
  )

  useEffect(() => {
    if (optsdays.length > 0 && !loadingCal && !loadingRecs) {
      const dateRangeStart = new Date(optsdays[0].label_full)
      const months = getRangedMonths(dateRangeStart)

      if (calendarData2.length !== 0) {
        const municipalCalendar1 = calendarData2.data1.find(
          (_municipalCalendar) =>
            _municipalCalendar.municipality === sel_options.sel_municipality &&
            _municipalCalendar.crop === sel_options.sel_crop
        )

        const municipalCalendar2 = calendarData2.data2.find(
          (_municipalCalendar) =>
            _municipalCalendar.municipality === sel_options.sel_municipality &&
            _municipalCalendar.crop === sel_options.sel_crop
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
              code: code
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
    loadingRecs
  ])

  const {
    // error: repError,
    status: reportLoading,
    report
  } = useSelector((state) => state.reports)

  const reportType = useSelector((state) => state.dashboard.reportType)
  const isEnglish = useSelector((state) => state.dashboard.isEnglish)

  // Flags
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const mounted = useRef(false)

  // Misc states
  const [smsText, setSmsText] = useState('')
  const [pdfPreview, setPdfPreview] = useState(defaultBulletin)
  const [message, setMessage] = useState(DEFAULT_REPORT_DIALOGS)
  const dispatch = useDispatch()

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
    // Reset the processed (grouped) recommendations on store
    dispatch(filteredRecommendationReceived([]))
    dispatch(reportReset())
  }, [dispatch])

  // Initialize province selection options
  useEffect(() => {
    if (provinces.length > 0) {
      // Set the static province list selection options
      setOptsProvinces(formatSelectOptions(provinces))
    }
  }, [provinces])

  // Initialize 10-day weather forecast common summary
  useEffect(() => {
    if (tendayForecastSummary !== null) {
      setSelOptions((prev) => ({
        ...prev,
        sel_month: { label: tendayForecastSummary.date_range }
      }))
    }
  }, [tendayForecastSummary])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(
      loading ||
        loadingRecs ||
        loadingCal ||
        tenLoading ||
        loadingRecsSMS ||
        isLoadingSupportServices
    )
  }, [
    loading,
    loadingRecs,
    loadingCal,
    tenLoading,
    loadingRecsSMS,
    isLoadingSupportServices
  ])

  useEffect(() => {
    // Watch language toggle
    setPdfPreview(defaultBulletin)
  }, [isEnglish])

  // useEffect(() => {
  //   // Watch data loading & hooks errors
  //   if (errCalData !== '' || errRecommendations !== '' || tendayForecastError !== '' || errCalendar !== '') {
  //     const errMsg = errCalData || errRecommendations || tendayForecastError || errCalendar
  //     setSelOptions(prev => ({ ...prev, error: errMsg }))
  //   } else {
  //     setSelOptions(prev => ({ ...prev, error: '' }))
  //   }
  // }, [errCalendar, errRecommendations, tendayForecastError, errCalData])

  useEffect(() => {
    // Set the SMS text content
    if (recommendationsSMSData.length !== 0) {
      setSmsText(
        recommendationsSMSData[0].sms.replace(
          '{{10_day_range_identifier}}',
          sel_options.sel_month.label
        )
      )
    }
  }, [recommendationsSMSData, sel_options.sel_month])

  useEffect(() => {
    // Save report watcher
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

  useEffect(() => {
    // Dispatch the processed recommendations to the recommendations list viewer
    if (!recsGroupError && recommendationsGroup !== null) {
      dispatch(filteredRecommendationReceived(recommendationsGroup))
    }
  }, [recommendationsGroup, recsGroupError, dispatch])

  // useEffect(() => {
  //   if (!loading && !loadingCal && !loadingRecs && sel_options.error === '') {
  //     if (optscropstages.length > 0) {
  //       // Set the uniqe crop stages, crops and month (date range) labels
  //       // const stageCodes = uniquecropstages.map(stage => stage.code).toString()
  //       // const stageLabels = uniquecropstages.map(stage => stage.label).toString()
  //       // setOptsCropStage(stageCodes)
  //       setSelOptions(prev => ({
  //         ...prev,
  //         sel_crop: parsedCropList.map(crop => crop.label).toString().split(',').join(', '),
  //         // sel_stage: stageLabels
  //       }))
  //     } else {
  //       dispatch(filteredRecommendationReceived([]))

  //       // TO-DO: Investigate this react-hooks/exhaustive-deps warning
  //       /* eslint-disable react-hooks/exhaustive-deps */
  //       if (sel_options.sel_municipality !== null) {
  //         setSelOptions(prev => ({
  //           ...prev,
  //           error: `No crop stages are available for this date on ${prev.sel_municipality}.`
  //         }))
  //       }
  //     }
  //   }
  // }, [optscropstages, parsedCropList, loading, loadingCal, loadingRecs, /* sel_options.sel_municipality */, dispatch])

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

    if (sel_options.error !== '') {
      setSelOptions((prev) => ({ ...prev, error: '' }))
    }

    if (Object.keys(newValue).includes('id')) {
      switch (from) {
        case 'province':
          setOptsCropStage([])

          // Set the selected province
          setSelOptions((prev) => ({
            ...prev,
            sel_province: label,
            sel_municipality: null,
            sel_crop: null,
            sel_stage: null,
            sel_activity: null
          }))
          break
        case 'municipality':
          setOptsCropStage([])

          // Set the selected municipality
          setSelOptions((prev) => ({
            ...prev,
            sel_municipality: label,
            sel_crop: null,
            sel_stage: null,
            sel_activity: null
          }))

          // Set the sub (municipality) cropping calendar
          // setMunicipalCropCal(calendarData.filter(rec => rec.municipality === label))
          break
        case 'crop':
          setSelOptions((prev) => ({
            ...prev,
            sel_crop: label,
            sel_stage: null,
            sel_activity: null
          }))
          setOptsCropStage([])
        default:
          break
      }
    } else {
      // Input cleared
      if (from === 'province') {
        const temp = sel_options.sel_month
        setSelOptions({ ...defaultSelected, sel_month: temp })
        setOptsCropStage([])
      } else if (from === 'municipality') {
        setSelOptions({
          ...sel_options,
          sel_municipality: null,
          sel_crop: null,
          sel_day: null,
          sel_stage: null,
          sel_activity: null
        })
        setOptsCropStage([])
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
        municipality: sel_options.sel_municipality,
        operation: 'preview',
        language: isEnglish ? 'en' : 'tag',
        // TO-DO: Set to user-selected crop
        crop: sel_options?.sel_crop,
        services: services.map((service) => service.data)
      }

      setOpen(true)
      setSelOptions((prev) => ({ ...prev, loading: true, error: '' }))
      const response = await previewBulletinTenday(body)

      const blob = new Blob([response], { type: 'application/pdf' })
      const link = {}

      link.href = URL.createObjectURL(blob)
      link.download = `${sel_options.sel_province}_${sel_options.sel_municipality}.pdf`

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

  const resetSelections = () => {
    const temp = sel_options.sel_month
    setSelOptions({ ...defaultSelected, sel_month: temp })
    setOptsCropStage([])
    dispatch(filteredRecommendationReceived([]))
  }

  // Save the report and upload the PDF to storage
  const handleSave = async () => {
    setMessage({ ...message, loading: true, msg: 'Saving report...' })

    try {
      const body = {
        region: process.env.REGION_NAME,
        province: sel_options.sel_province,
        municipality: sel_options.sel_municipality,
        operation: 'create',
        language: isEnglish ? 'en' : 'tag',
        // TO-DO: Set to user-selected crop
        crop: sel_options.sel_crop,
        services: services.map((service) => service.data)
      }

      dispatch(createTenDReport(body))
        .unwrap()
        .then(() => {
          // Load the 10-Day reports list if its not yet loaded
          if (reportType !== REPORT_TYPE.TEN_DAY) {
            dispatch(reportTypeReceived(REPORT_TYPE.TEN_DAY))
            dispatch(
              fetchReports({
                uid: user.uid,
                type: REPORT_TYPE.TEN_DAY
              })
            )
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setMessage((prev) => ({
              ...prev,
              msg: error,
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

      setSelOptions((prev) => ({ ...prev, loading: false, error: errMsg }))
    }
  }

  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <CommonCreateReportComponent
        climateRisk={climateRisk.label}
        optsprovinces={optsprovinces}
        optsmunicipalities={optsmunicipalities}
        optscrops={parsedCropList}
        optscropstages={optscropstages}
        optsactivities={optsactivities}
        sel_options={sel_options}
        loading={isLoading}
        recommendationsData={recommendationsData}
        isloadingreport={reportLoading === ADAPTER_STATES.PENDING}
        isdisabled={false}
        open={open}
        message={message}
        smstext={smsText}
        pageTitle="10-Day Farm Weather Outlook and Advisory Bulletin"
        pageDescription="Create <strong>10-Day Farm Weather Outlook and Advisory</strong> crop recommendations bulletins.
          Finalized bulletins will be automatically uploaded to the site for public download."
        pdfPreview={pdfPreview}
        onSelectItemChange={onSelectItemChange}
        handlePreview={handlePreview}
        handleSave={handleSave}
        toggleViewerOpen={toggleViewerOpen}
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

export default withAuthListener(CreateTendayBulletinV2)
