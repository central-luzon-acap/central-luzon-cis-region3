import { useEffect, useState, useCallback } from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import { formatSelectOptions } from '@/utils/formatters'
import { getProvincesMunicipalities } from '@/services/region'
import { getPageAssetsDoc } from '@/services/utilities'
import useCrops from '@/hooks/cropping_calendar/usecrops'
import useCroppingCalendarViz from '@/hooks/cropping_calendar/usecroppingcalendarviz'
import useFetchCroppingCalendar from '@/hooks/cropping_calendar/usefetchcroppingcalendar'
import useFetchCroppingCalendarV2 from '@/hooks/cropping_calendar/usefetchcroppingcalendarv2'
import useMunicipalities from '@/hooks/municipalities/usemunicipalities'
import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'

import CroppingCalendarV2Component from '@/components/cropping_calendar'
import CroppingCalendarSeasonalComponent from '@/components/cropping_calendar_seasonal'
import ShareHead from '@/common/layout/sharehead'

const CROPS = {
  RICE: 'Rice',
  PILI: 'Pili',
  CORN: 'Corn',
  AMPALAYA: 'Ampalaya',
  TOMATO:'Tomato',
  CUCUMBER: 'Cucumber',
  POLE_SITAO: 'PoleSitao',
  CASSAVA: 'Cassava',
  COCONUT: 'Coconut',
  PINEAPPLE: 'Pineapple',
  ABACA: 'Abaca',
  CUT_FLOWERS: 'Cut-flowers',
  LIVESTOCK: 'Livestock',
  POULTRY: 'Poultry',
  FISHERIES: 'Fisheries (brackish and freshwater)',
}
const defaultSelected = {
  sel_province: null,
  sel_municipality: null,
  sel_crop: CROPS.RICE,
  error: '',
}
const defaultSelectedSeasonal = {
  sel_province: null,
  sel_crop: CROPS.RICE,
  error: '',
}

// Default component state
const ASSET_KEY = 'og_calendar'

// NextJS static props
export async function getStaticProps() {
  let media = {
    description: '',
    url: '',
    path: `${process.env.BASE_URL}/cropping-calendar`,
  }

  if (process.env.BASE_URL === process.env.BASE_URL_PROD) {
    const data = await getPageAssetsDoc('opengraph', 'og', true)
    const item = data.find((item) => item.filename === ASSET_KEY)

    if (item) {
      media.description = item.description
      media.url = item.url
    }
  }

  return {
    props: {
      media,
    },
  }
}

function CroppingCalendarV2({ media }) {
  const [tabValue, setTabValue] = useState(0)

  // Synced municipality names reference
  const [provinces, setProvinces] = useState([])

  // Selected autocomplete drop-down menu items
  const [sel_options, setSelOptions] = useState(defaultSelected)
  const [sel_options_seasonal, setSelOptionsSeasonal] = useState(
    defaultSelectedSeasonal,
  )

  // Municipal raw cropping calendar
  const [subcalendar, setSubCalendar] = useState([])
  const [subcalendarSeasonal, setSubCalendarSeasonal] = useState([])

  // Province list
  const [optsprovinces, setOptsProvinces] = useState([])

  // Mnicipalities list of a province
  const optsmunicipalities = useMunicipalities(
    sel_options.sel_province,
    provinces,
  )

  // Raw provincial-level cropping calendar data
  const {
    cropcalendar: calendarData,
    // loading: loadingCal,
    error: errCalData,
  } = useFetchCroppingCalendar(sel_options.sel_province)

  const { cropList } = useFetchCrops()

  const {
    cropcalendar: calendarData2,
    cropStages,
    loading: loadingCal,
  } = useFetchCroppingCalendarV2(
    '10-day',
    sel_options.sel_province,
    sel_options.sel_crop,
  )

  const {
    cropcalendar: calendarDataSeasonal,
    cropStages: cropStagesSeasonal,
    loading: loadingCalSeasonal,
  } = useFetchCroppingCalendarV2(
    'seasonal',
    sel_options.sel_province,
    sel_options.sel_crop,
  )

  // Crops list of a municipality
  const optscrops = useCrops(calendarData, sel_options.sel_municipality)

  // Municipality's crop calendar stages for a specific crop converted to codes for data vizualization
  // console.log('subcalendar:', subcalendar)
  const { stagesforviz: processedCalendar, error: vizError } =
    useCroppingCalendarViz(subcalendar, cropStages)

  const { stagesforviz: processedCalendarSeasonal, error: vizErrorSeasonal } =
    useCroppingCalendarViz(subcalendarSeasonal, cropStagesSeasonal)

  // Flags

  // On-going remote data fetching
  const [isLoading, setIsLoading] = useState(true)

  // Extracts the cropping calendar data of the current-active crop and municipality
  const setSubCalendarData = useCallback(
    (municipalityName) => {
      // Filter crop calendar from selected province-municipality-crop combo
      let data
      calendarData2?.data1?.forEach((item, index) => {
        if (
          item.municipality === municipalityName &&
          item.crop === sel_options.sel_crop
        ) {
          data = { calendar: item, index }
        }
      })

      if (data) {
        const data1 = data.calendar
        const data2 = calendarData2.data2[data.index]
        setSubCalendar([data1, data2])
      } else setSubCalendar([])
    },
    [calendarData2, sel_options.sel_crop],
  )

  useEffect(() => {
    if (Object.keys(calendarDataSeasonal).length) {
      const _subcalendarSeasonal = [
        calendarDataSeasonal.data1[0],
        calendarDataSeasonal.data2[0],
      ]
      setSubCalendarSeasonal(_subcalendarSeasonal)
    } else setSubCalendarSeasonal([])
  }, [calendarDataSeasonal, sel_options_seasonal.sel_crop])

  useEffect(() => {
    // TO-DO: Use hooks
    const loadProvinces = async () => {
      try {
        const provinces = await getProvincesMunicipalities()
        setProvinces(provinces.data)
      } catch (error) {
        // console.error(error.message)
      }
    }

    loadProvinces()
  }, [])

  useEffect(() => {
    // Set the static province list selection options
    if (provinces.length > 0) {
      const provincelist = formatSelectOptions(provinces)
      setOptsProvinces(provincelist)
      setSelOptions((prev) => ({
        ...prev,
        sel_province: provincelist[0].label,
      }))
      setSelOptionsSeasonal((prev) => ({
        ...prev,
        sel_province: provincelist[0].label,
      }))
    }
  }, [provinces])

  useEffect(() => {
    // Auto-select the 1st new municipality

    if (
      optsmunicipalities.length > 0 &&
      calendarData2.data1?.length > 0 &&
      sel_options.sel_province === (calendarData2.data1[0]?.province ?? '')
    ) {
      setSubCalendarData(optsmunicipalities[0].label)
      setSelOptions((prev) => ({
        ...prev,
        sel_municipality: optsmunicipalities[0].label,
      }))
    }
  }, [
    optsmunicipalities,
    calendarData2,
    setSubCalendarData,
    sel_options.sel_province,
  ])

  useEffect(() => {
    // Watch data loading status
    setIsLoading(loadingCal || loadingCalSeasonal)
  }, [loadingCal, loadingCalSeasonal])

  useEffect(() => {
    // Watch data loading and other misc errors from hooks
    if (errCalData !== '' || vizError !== '' || vizErrorSeasonal !== '') {
      const errMsg = errCalData || vizError
      const errMsgSeasonal = vizErrorSeasonal
      setSelOptions((prev) => ({ ...prev, error: errMsg }))
      setSelOptionsSeasonal((prev) => ({ ...prev, error: errMsgSeasonal }))
    } else {
      setSelOptions((prev) => ({ ...prev, error: '' }))
      setSelOptionsSeasonal((prev) => ({ ...prev, error: '' }))
    }
  }, [errCalData, vizError, vizErrorSeasonal])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    )
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  // Handle select options
  const onSelectItemChange = (e, newValue) => {
    const { label, from } = newValue

    if (sel_options.error !== '') {
      setSelOptions({ ...sel_options, error: '' })
    }

    if (label !== undefined) {
      switch (from) {
        case 'province':
          // Reset the sub calendar
          setSubCalendar([])
          setSubCalendarSeasonal([])

          // Set the selected province
          setSelOptions({
            ...defaultSelected,
            sel_crop: sel_options.sel_crop,
            sel_province: label,
          })
          setSelOptionsSeasonal({
            ...defaultSelectedSeasonal,
            sel_crop: sel_options.sel_crop,
            sel_province: label,
          })
          break
        case 'municipality':
          setSubCalendarData(label)

          // Set the selected municipality
          setSelOptions({ ...sel_options, sel_municipality: label })
          break
        case CROPS.RICE:
        case CROPS.PILI:
        case CROPS.CORN:
        case CROPS.POLE_SITAO:
        case CROPS.AMPALAYA:
        case CROPS.TOMATO:
        case CROPS.CUCUMBER:
        case CROPS.WATERMELON:
        case CROPS.LOWLAND_VEGETABLES:
        case CROPS.CASSAVA:
        case CROPS.COCONUT:
        case CROPS.PINEAPPLE:
        case CROPS.ABACA:
        case CROPS.CUT_FLOWERS:
        case CROPS.LIVESTOCK:
        case CROPS.POULTRY:
        case CROPS.FISHERIES:
          setSubCalendar([])
          setSubCalendarSeasonal([])
          setSelOptions({ ...sel_options, sel_crop: from })
          setSelOptionsSeasonal({ ...sel_options, sel_crop: from })
          break
        default:
          break
      }
    } else {
      // Input cleared
      if (from === 'province') {
        setSelOptions(defaultSelected)
        setSelOptionsSeasonal(defaultSelectedSeasonal)
      } else if (from === 'municipality') {
        setSelOptions({
          ...sel_options,
          sel_municipality: null,
          sel_crop: null,
        })
      }
    }
  }

  return (
    <div id="bacap-cropping-calendar">
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title="Agro-Climatic Advisory Portal - Region 3 (ACAP-CENTRAL LUZON) Cropping Calendar"
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      )}

      <Typography variant="h4">Cropping Calendar</Typography>

      <Box
        sx={{
          width: '100%',
          marginTop: '20px',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="MUNICIPAL" {...a11yProps(0)} />
            <Tab label="PROVINCIAL" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* 10-day Cropping Calendar Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <CroppingCalendarV2Component
            optsprovinces={optsprovinces}
            optsmunicipalities={optsmunicipalities}
            subcalendar={subcalendar}
            processedCalendar={processedCalendar}
            cropList={cropList}
            cropStages={cropStages}
            optscrops={optscrops}
            sel_options={sel_options}
            loading={isLoading}
            onSelectItemChange={onSelectItemChange}
          />
        </TabPanel>

        {/* Seasonal Cropping Calendar Tab Content */}
        <TabPanel value={tabValue} index={1}>
          <CroppingCalendarSeasonalComponent
            optsprovinces={optsprovinces}
            subcalendar={subcalendarSeasonal}
            processedCalendar={processedCalendarSeasonal}
            cropList={cropList}
            cropStages={cropStagesSeasonal}
            optscrops={optscrops}
            sel_options={sel_options_seasonal}
            loading={isLoading}
            onSelectItemChange={onSelectItemChange}
          />
        </TabPanel>
      </Box>
    </div>
  )
}

export default CroppingCalendarV2
