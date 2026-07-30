import { useEffect, useState, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Components
import SpecialReportComponent from '@/domain/admin/bulletins/special'
import ProtectedPage from '@/common/layout/protectedpage'
import withAuthListener from '@/common/entities/withauth'

// Services
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { _Utilities } from '@/services/utilities/utilities'
import { getProvincesMunicipalities } from '@/services/region'
import { createSpecialWReport } from '@/store/reports/reportThunks'
import { fetchReports } from '@/store/reports/reportThunks'
import { previewBulletinSpecial } from '@/services/report'
import { ADAPTER_STATES } from '@/store/constants'

// Redux
import { recommendationReset } from '@/store/recommendations/recommendationSlice'

// Hooks
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'
import useMunicipalitiesAffected from '@/hooks/municipalities/usemunicipalitiesaffected'
import useMunicipalities from '@/hooks/municipalities/usemunicipalities'
import useWindSignals from '@/hooks/cyclone/usewindsignals'
import useFetchRecommendationsQuery from '@/hooks/recommendationsv2/usefetchrecommendationsquery'
import { useDocument } from '@/hooks/usefirestore'

// Constants
import { REPORT_TYPE, DEFAULT_REPORT_DIALOGS } from '@/utils/constants/app'
import { ACCOUNT_LEVEL, WIND_SIGNAL_CODES } from '@/utils/constants'

// Utilities
import { reportTypeReceived } from '@/store/dashboard/dashboardSlice'
import { reportReset } from '@/store/reports/reportSlice'
import { parseBlobErrorResponse } from '@/utils/common'

const defaultBulletin = { url: '', filename: '' }

const defaultSelected = {
  sel_province: null,
  sel_municipality: null,
  sel_crop: null,
  sel_signal: null,
  sel_typhoon: null,
  processed: false,
  loading: false,
  error: '',
  success: ''
}

// Note: This page only needs to display "all" applicable options that meet the conditions
// unlike its public-viewing counterpart which also needs to display the "not-applicable" options for show
function CreateSpecialBulletinV2 ({ user, onBtnLogoutClick, loading }) {
  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)

  // Raw provinces list
  const [provinces, setProvinces] = useState([])

  // Selectors
  const { status: reportLoading, report } = useSelector((state) => state.reports)
  const reportType = useSelector((state) => state.dashboard.reportType)
  const isEnglish = useSelector((state) => state.dashboard.isEnglish)

  // Flags
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const mounted = useRef(false)

  // Misc states
  const [pdfPreview, setPdfPreview] = useState(defaultBulletin)
  const [message, setMessage] = useState(DEFAULT_REPORT_DIALOGS)

  const dispatch = useDispatch()

  // Dynamic computed/processed data using hooks

  // Latest tropical cyclone typhoon data
  const [cycloneData, cycloneLoading] = useDocument(_Utilities.GLOBAL_COLLECTIONS, _Utilities.CYCLONE_ADVISORY)

  // Current admin-encoded wind signal data
  const [windSignalData, wsLoading] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_SPECIAL_COMMON}/${_WeatherForecastGetter.COMMON_SPECIAL_TYPE.WIND_SPEED}`)

  // Wind signal list from PAGASA cyclone data
  const {
    windSignals: optswindsignals
  } = useWindSignals(cycloneData, cycloneLoading)

  // Initialize province and municipalites selection options
  const {
    affectedprovinces: optsprovinces
  } = useMunicipalitiesAffected(windSignalData, cycloneData, provinces, sel_options?.sel_signal)

  // Muicipalities list of a province
  const optsmunicipalities = useMunicipalities(sel_options.sel_province, optsprovinces)

  // Crops list
  const { cropList, loading: loadingCrops } = useFetchCrops()
  const parsedCropList = cropList.map((crop, index) => {
    return {
      disabled: false,
      label: crop,
      id: index
    }
  })

  // Flag to disable the GENERATE button
  const isGenerateDisabled = useMemo(() => {
    if (sel_options.sel_signal?.value === 0 && sel_options?.sel_crop !== null) {
      // No signal
      return false
    } else if (sel_options.sel_signal?.value > 0) {
      // Has signal; user must have selected province & municipality
      return !sel_options.sel_province  || !sel_options.sel_municipality
    } else {
      return true
    }
  }, [sel_options])

  // Recommendations data reference and farm operations
  const {
    loading: loadingRecs,
    error: errRecommendations
  } = useFetchRecommendationsQuery({
    type: 'special',
    crop: sel_options?.sel_crop,
    signal: sel_options?.sel_signal?.code,
    isDispatch: true
  })

  // Special weather forecast SMS data
  const {
    recommendations: specialSMS,
    loading: loadingSMS,
    error: errSMS
  } = useFetchRecommendationsQuery({
    type: 'special_sms',
    crop: sel_options?.sel_crop,
    signal: sel_options?.sel_signal?.code
  })

  // Special weather forecast SMS text
  const smsText = useMemo(() => {
    if (specialSMS?.length > 0 &&  cycloneData) {
      let sms = specialSMS[0].sms.replace(
        '{{special_weather_name_identifier}}',
        cycloneData?.data?.meta?.typhoon_name ?? '-'
      )

      if (sel_options?.sel_province &&  sel_options?.sel_municipality) {
        sms = sms.replace(
          '{{municipality_identifier}}',
          `${sel_options?.sel_province}, ${sel_options?.sel_municipality}`
        )
      }

      return sms
    }

    return null
  }, [specialSMS, cycloneData, sel_options?.sel_province, sel_options?.sel_municipality])

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
    dispatch(recommendationReset())
    dispatch(reportReset())
  }, [dispatch])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(loading || loadingRecs || loadingCrops || loadingSMS ||
      (cycloneLoading === ADAPTER_STATES.PENDING) ||
      (wsLoading === ADAPTER_STATES.PENDING))
  }, [loading, loadingRecs, loadingCrops, loadingSMS, cycloneLoading, wsLoading])

  useEffect(() => {
    // Watch language toggle
    setPdfPreview(defaultBulletin)
  }, [isEnglish])


  useEffect(() => {
    // Watch data loading & hooks errors
    if (errRecommendations !== '') {
      const errMsg = errRecommendations || errSMS
      setSelOptions(prev => ({ ...prev, error: errMsg }))
    } else {
      setSelOptions(prev => ({ ...prev, error: '' }))
    }
  }, [errRecommendations, errSMS])

  useEffect(() => {
    // Save report watcher
    if (reportLoading === ADAPTER_STATES.FULLFILLED && report !== null) {
      if (mounted.current) {
        setMessage(prev => ({
          ...prev,
          msg: 'Success! Bulletin report created.',
          loading: false, savesuccess: true, docId: report.id
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

    if (['signal', 'crop'].includes(from)) {
      dispatch(recommendationReset())
    }

    if (sel_options.error !== '') {
      setSelOptions(prev => ({ ...prev, error: '' }))
    }

    if (Object.keys(newValue).includes('id')) {
      switch (from) {
        case 'signal':
          // Set the selected PAGASA wind signal and typhoon name
          setSelOptions({
            ...defaultSelected,
            sel_signal: newValue,
            sel_typhoon: newValue?.code === WIND_SIGNAL_CODES.SIGNAL_0
              ? '(General - No Signal)'
              : cycloneData?.data?.meta?.typhoon_name ?? '-'
          })
          break
        case 'crop':
          // Set the selected crop
          setSelOptions(prev => ({ ...prev, sel_crop: label }))
          break
        case 'province':
          // Set the selected province
          setSelOptions(prev => ({ ...prev, sel_province: label, sel_municipality: null }))
          break
        case 'municipality':
          // Set the selected municipality
          setSelOptions(prev => ({ ...prev, sel_municipality: label }))
          break
        default:
          break
      }
    } else {
      // Input cleared
      if (from === 'signal') {
        setSelOptions(defaultSelected)
      } else if (from === 'crop') {
        setSelOptions(prev => ({ ...prev, sel_crop: null }))
      } else if (from === 'province') {
        setSelOptions(prev => ({ ...prev, sel_province: null, sel_municipality: null }))
      } else if (from === 'municipality') {
        setSelOptions(prev => ({ ...prev, sel_municipality: null }))
      }
    }
  }

  const handlePreview = async () => {
    // Display PDF blob from cache
    if (pdfPreview.url !== '') {
      setOpen(true)
      return
    }

    setSelOptions(prev => ({ ...prev, loading: true, error: '', success: '' }))

    try {
      const body = {
        region: process.env.REGION_NAME,
        province: sel_options.sel_province,
        municipality: sel_options.sel_municipality,
        crop: sel_options.sel_crop,
        language: (isEnglish) ? 'en' : 'tag',
        signal: sel_options?.sel_signal.code,
        operation: 'preview'
      }

      setOpen(true)
      setSelOptions(prev => ({ ...prev, loading: true, error: '' }))
      const response = await previewBulletinSpecial(body)

      const blob = new Blob([response], { type: 'application/pdf' })
      const link = {}

      link.href = URL.createObjectURL(blob)
      link.download = `${sel_options.sel_province}_${sel_options.sel_municipality}.pdf`

      setPdfPreview(prev => ({ ...prev, url: link.href, filename: link.download }))
      setSelOptions(prev => ({ ...prev, loading: false, success: 'Bulletin preview created.' }))
    } catch (err) {
      const errorResponse = await parseBlobErrorResponse(err)
      setSelOptions(prev => ({ ...prev, loading: false, error: errorResponse }))
    }
  }

  const toggleViewerOpen = () => {
    setOpen(prev => !prev)
  }

  const resetSelections = () => {
    setSelOptions(defaultSelected)
    dispatch(recommendationReset())
  }

  // Save the report and upload the PDF to storage
  const handleSave = async () => {
    setMessage({ ...message, loading: true, msg: 'Saving report...' })

    try {
      const body = {
        region: process.env.REGION_NAME,
        province: sel_options.sel_province,
        municipality: sel_options.sel_municipality,
        crop: sel_options.sel_crop,
        language: (isEnglish) ? 'en' : 'tag',
        signal: sel_options?.sel_signal.code,
        operation: 'create'
      }

      dispatch(createSpecialWReport(body))
        .unwrap()
        .then(() => {
          // Load the 10-Day reports list if its not yet loaded
          if (reportType !== REPORT_TYPE.SPECIAL_WEATHER) {
            dispatch(reportTypeReceived(REPORT_TYPE.SPECIAL_WEATHER))
            dispatch(fetchReports({
               uid: user.uid,
               type: REPORT_TYPE.SPECIAL_WEATHER
            }))
          }
        })
        .catch(error => {
          if (mounted.current) {
            setMessage(prev => ({
              ...prev,
              msg: error,
              loading: false, savesuccess: false, docId: null
            }))
          }
        })
    } catch (err) {
      let errMsg = ''

      if (err.response !== undefined) {
        errMsg = (err.response.data !== undefined && typeof err.response.data === '[object Blob]') ? err.response.data : ''
      }

      if (errMsg === '') {
        errMsg = err.message
      }

      setSelOptions(prev => ({ ...prev, loading: false, error: errMsg }))
    }
  }

  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <SpecialReportComponent
        optsprovinces={optsprovinces}
        optsmunicipalities={optsmunicipalities}
        optswindsignals={optswindsignals}
        optscrops={parsedCropList}
        sel_options={sel_options}
        loading={isLoading}
        isloadingreport={reportLoading === ADAPTER_STATES.PENDING}
        isdisabled={isGenerateDisabled}
        open={open}
        message={message}
        smstext={smsText}
        pageTitle='Special Weather Bulletin'
        pageDescription='Create <strong>Special Weather</strong> crop recommendations bulletins.
          Finalized bulletins will be automatically uploaded to the site for public download.'
        pdfPreview={pdfPreview}
        onSelectItemChange={onSelectItemChange}
        handlePreview={handlePreview}
        handleSave={handleSave}
        toggleViewerOpen={toggleViewerOpen}
        resetSelections={resetSelections}
        togglePrompt={() => {
          setMessage(prev => ({ ...DEFAULT_REPORT_DIALOGS, isOpen: !prev.isOpen }))
        }}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(CreateSpecialBulletinV2)
