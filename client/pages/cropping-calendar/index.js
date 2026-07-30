// import { useEffect, useState, useCallback } from 'react'
// import Typography from '@mui/material/Typography'

// import { formatSelectOptions } from '@/utils/formatters'
// import { getProvincesMunicipalities } from '@/services/region'
// import { getPageAssetsDoc } from '@/services/utilities'
// import useCrops from '@/hooks/cropping_calendar/usecrops'
// import useCroppingCalendarViz from '@/hooks/cropping_calendar/usecroppingcalendarviz'
// import useFetchCroppingCalendar from '@/hooks/cropping_calendar/usefetchcroppingcalendar'
// import useMunicipalities from '@/hooks/municipalities/usemunicipalities'

// import CroppingCalendarV2Component from '@/components/cropping_calendar'
// import ShareHead from '@/common/layout/sharehead'
// import { REGION_NAME } from '@/utils/constants'

// const CROPS = {
//   RICE: 'Rice',
//   PILI: 'Pili',
//   CORN: 'Corn',
//   LOWLAND_VEGETABLES: 'Lowland Vegetables',
//   CASSAVA: 'Cassava',
//   COCONUT: 'Coconut',
//   PINEAPPLE: 'Pineapple',
//   ABACA: 'Abaca',
//   CUT_FLOWERS: 'Cut-flowers',
//   LIVESTOCK: 'Livestock',
//   POULTRY: 'Poultry',
//   FISHERIES: 'Fisheries (brackish and freshwater)',
// }
// const defaultSelected = {
//   sel_province: null,
//   sel_municipality: null,
//   sel_crop: CROPS.RICE,
//   error: '',
// }

// // Default component state
// const ASSET_KEY = 'og_calendar'

// // NextJS static props
// export async function getStaticProps() {
//   let media = {
//     description: '',
//     url: '',
//     path: `${process.env.BASE_URL}/cropping-calendar`,
//   }

//   if (process.env.BASE_URL === process.env.BASE_URL_PROD) {
//     const data = await getPageAssetsDoc('opengraph', 'og', true)
//     const item = data.find((item) => item.filename === ASSET_KEY)

//     if (item) {
//       media.description = item.description
//       media.url = item.url
//     }
//   }

//   return {
//     props: {
//       media,
//     },
//   }
// }

function CroppingCalendarV2() {
  // // Synced municipality names reference
  // const [provinces, setProvinces] = useState([])

  // // Selected autocomplete drop-down menu items
  // const [sel_options, setSelOptions] = useState(defaultSelected)

  // // Municipal raw cropping calendar
  // const [subcalendar, setSubCalendar] = useState(null)

  // // Province list
  // const [optsprovinces, setOptsProvinces] = useState([])

  // // Mnicipalities list of a province
  // const optsmunicipalities = useMunicipalities(
  //   sel_options.sel_province,
  //   provinces,
  // )

  // // Raw provincial-level cropping calendar data
  // const {
  //   cropcalendar: calendarData,
  //   loading: loadingCal,
  //   error: errCalData,
  // } = useFetchCroppingCalendar(sel_options.sel_province)

  // // Crops list of a municipality
  // const optscrops = useCrops(calendarData, sel_options.sel_municipality)

  // // Municipality's crop calendar stages for a specific crop converted to codes for data vizualization
  // const { stagesforviz: processedCalendar, error: vizError } =
  //   useCroppingCalendarViz(subcalendar)

  // // Flags

  // // On-going remote data fetching
  // const [isLoading, setIsLoading] = useState(true)

  // // Extracts the cropping calendar data of the current-active crop and municipality
  // const setSubCalendarData = useCallback(
  //   (municipalityName) => {
  //     // Filter crop calendar from selected province-municipality-crop combo
  //     setSubCalendar(
  //       calendarData.find(
  //         (x) =>
  //           x.municipality === municipalityName &&
  //           x.crop === sel_options.sel_crop,
  //       ),
  //     )
  //   },
  //   [calendarData, sel_options.sel_crop],
  // )

  // useEffect(() => {
  //   // TO-DO: Use hooks
  //   const loadProvinces = async () => {
  //     try {
  //       const provinces = await getProvincesMunicipalities()
  //       setProvinces(provinces.data)
  //     } catch (error) {
  //       // console.error(error.message)
  //     }
  //   }

  //   loadProvinces()
  // }, [])

  // useEffect(() => {
  //   // Set the static province list selection options
  //   if (provinces.length > 0) {
  //     const provincelist = formatSelectOptions(provinces)
  //     setOptsProvinces(provincelist)
  //     setSelOptions((prev) => ({
  //       ...prev,
  //       sel_province: provincelist[0].label,
  //     }))
  //   }
  // }, [provinces])

  // useEffect(() => {
  //   // Auto-select the 1st new municipality
  //   if (
  //     optsmunicipalities.length > 0 &&
  //     calendarData.length > 0 &&
  //     sel_options.sel_province === (calendarData[0]?.province ?? '')
  //   ) {
  //     setSubCalendarData(optsmunicipalities[0].label)
  //     setSelOptions((prev) => ({
  //       ...prev,
  //       sel_municipality: optsmunicipalities[0].label,
  //     }))
  //   }
  // }, [
  //   optsmunicipalities,
  //   calendarData,
  //   setSubCalendarData,
  //   sel_options.sel_province,
  // ])

  // useEffect(() => {
  //   // Watch data loading status
  //   setIsLoading(loadingCal)
  // }, [loadingCal])

  // useEffect(() => {
  //   // Watch data loading and other misc errors from hooks
  //   if (errCalData !== '' || vizError !== '') {
  //     const errMsg = errCalData || vizError
  //     setSelOptions((prev) => ({ ...prev, error: errMsg }))
  //   } else {
  //     setSelOptions((prev) => ({ ...prev, error: '' }))
  //   }
  // }, [errCalData, vizError])

  // // Handle select options
  // const onSelectItemChange = (e, newValue) => {
  //   const { label, from } = newValue

  //   if (sel_options.error !== '') {
  //     setSelOptions({ ...sel_options, error: '' })
  //   }

  //   if (label !== undefined) {
  //     switch (from) {
  //       case 'province':
  //         // Reset the sub calendar
  //         setSubCalendar(null)

  //         // Set the selected province
  //         setSelOptions({ ...defaultSelected, sel_province: label })
  //         break
  //       case 'municipality':
  //         setSubCalendarData(label)

  //         // Set the selected municipality
  //         setSelOptions({ ...sel_options, sel_municipality: label })
  //         break
  //       case CROPS.RICE:
  //       case CROPS.PILI:
  //       case CROPS.CORN:
  //       case CROPS.WATERMELON:
  //       case CROPS.LOWLAND_VEGETABLES:
  //       case CROPS.CASSAVA:
  //       case CROPS.COCONUT:
  //       case CROPS.PINEAPPLE:
  //       case CROPS.ABACA:
  //       case CROPS.CUT_FLOWERS:
  //       case CROPS.LIVESTOCK:
  //       case CROPS.POULTRY:
  //       case CROPS.FISHERIES:
  //         setSubCalendar(null)
  //         setSelOptions({ ...sel_options, sel_crop: from })
  //         break
  //       default:
  //         break
  //     }
  //   } else {
  //     // Input cleared
  //     if (from === 'province') {
  //       setSelOptions(defaultSelected)
  //     } else if (from === 'municipality') {
  //       setSelOptions({
  //         ...sel_options,
  //         sel_municipality: null,
  //         sel_crop: null,
  //       })
  //     }
  //   }
  // }

  return (
    <h1>Being updated...</h1>
    // <div id='bacap-cropping-calendar'>
    //   {(process.env.BASE_URL === process.env.BASE_URL_PROD) &&
    //     <ShareHead
    //       title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Cropping Calendar`}
    //       ogDescription={media.description}
    //       ogImageURL={media.url}
    //       ogURL={media.path}
    //     />
    //   }

    //   <Typography variant="h4">Cropping Calendar</Typography>
    //   <Typography variant="label">Cropping Calendar page</Typography>

    //   <CroppingCalendarV2Component
    //     optsprovinces={optsprovinces}
    //     optsmunicipalities={optsmunicipalities}
    //     subcalendar={subcalendar}
    //     processedCalendar={processedCalendar}
    //     optscrops={optscrops}
    //     sel_options={sel_options}
    //     loading={isLoading}
    //     onSelectItemChange={onSelectItemChange}
    //   />
    // </div>
  )
}

export default CroppingCalendarV2
