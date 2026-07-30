import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { upsertSeasonalExcel } from '@/services/weatherforecast'
import { seasonalWeatherReceived } from '@/store/weather/seasonal/seasonalSlice'
import { getTimestampDateTimeString } from '@/utils/date'
import { updateCommonWeather } from '@/services/weatherforecast'
import { ADAPTER_STATES } from '@/store/constants'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import CycloneListComponent from './cyclonelist'

const documents = ['1st month', '2nd month', '3rd month', '4th month', '5th month', '6th month']
const maxStrLength = 10
const NO_DATA_AVAILABLE = 'nda'

function CycloneList () {
  const [state, setState] = useState([])
  const [file, setFile] = useState(null)
  const dispatch = useDispatch()
  const sLoading = useSelector((state) => state.seasonalweather.status)
  const loading = false

  useEffect(() => {
    // Initialize the cyclone list
    if (!loading && documents.length === 6) {
      setState(documents.reduce((acc, month, index) => {
        return [ ...acc, {
          id: index,
          full: month,
          month,
          isValid: false,
          value: ''
        } ]
      }, []))
    }
  }, [loading])

  /**
   * Checks for valid tropical cyclones input values
   * @param {String} stringValue - Input parameter for a tropical cyclone item. Allowed values are:
   *  - a. Single number between (0-10) = ex: "1"
   *  - b. Two numbers with "or" between = ex: "1 or 2"
   *  - c. No Data Available = ex: "nda"
   * @returns {Bool}
   */
  const isValidTropicalCycloneValue = (stringValue) => {
    const validCycloneSignals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => x.toString())
    const singleSignalNum = validCycloneSignals.includes(stringValue) // ex: "1"
    const validSignalWithOr = /^([0-9]|10) or ([0-9]|10)$/g.test(stringValue) // ex: "1 or 2"

    return ((validSignalWithOr || singleSignalNum) || stringValue === NO_DATA_AVAILABLE)
  }

  const handleInputChange = (e, action = 'update') => {
    const { id, value } = e.target
    const index = id.split('-')[1]
    const temp = [...state]

    if (temp[index]) {
      if (action === 'clear') {
        temp[index].value = ''
        temp[index].isValid = false
      } else {
        temp[index].value = value

        if (value.length >= maxStrLength) {
          temp[index].isValid = false
        } else {
          temp[index].isValid = (value !== '' && isValidTropicalCycloneValue(value))
        }
      }

      /* eslint-disable no-unused-vars */
      setState(prev => temp)
    }
  }

  const handleClearList = () => {
    setState(state.map(item => ({ ...item, isValid: false, value: '' })))
  }

  const handleFileUpload = async (formFile) => {
    return new Promise(async (resolve, reject) => {
        if (state.filter(item => !item.isValid).length >= 1) {
          reject(new Error('Please check your tropical cyclones list input'))
        } else {
          try {
            // Upload the excel file
            const updated = await upsertSeasonalExcel(formFile)

            // Upload the no. of tropical cyclone information
            await updateCommonWeather({
              type: _WeatherForecastGetter.SUB_SEASONAL_COMMON,
              body: {
                data: state.map(item => ({ id: item.id, value: item.value })),
                region: process.env.REGION_NAME,
                type: _WeatherForecastGetter.COMMON_SEASONAL_REGIONAL_TYPE.CYCLONES_COUNT
              }
            })

            dispatch(seasonalWeatherReceived(updated.map(record => ({
              ...record,
              date_created: getTimestampDateTimeString(record.date_created)
            }))))

            handleClearList()
            resolve(true)
          } catch (err) {
            reject(err)
          }
        }
      })
  }

  const handleFileSelected = (file) => {
    setFile(file)

    if (!file) {
      handleClearList()
    }
  }

  return (
    <CycloneListComponent
      state={state}
      file={file}
      isDisabled={sLoading === ADAPTER_STATES.PENDING}
      handleInputChange={handleInputChange}
      handleClearClick={handleClearList}
      handleFileUpload={handleFileUpload}
      handleFileSelected={handleFileSelected}
    />
  )
}

export default CycloneList
