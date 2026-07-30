import { useEffect, useState, useRef, useCallback } from 'react'
import { useDocument } from '@/hooks/usefirestore'
import { getFirestoreDateTimeString, getTimestampDateTimeString } from '@/utils/date'
import { updateCommonWeather } from '@/services/weatherforecast'
import { MESSAGE_TYPE } from '@/utils/constants'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import MoonPhaseListComponent from './moonphaselist'

const maxStrLength = 10

const MOON_PHASE_TYPE = {
  NEW_MOON: { code: 'new_moon', label: 'New Moon' },
  FIRST_QUARTER: { code: 'first_quarter', label: 'First Quarter' },
  FULL_MOON: { code: 'full_moon', label: 'Full Moon' },
  LAST_QUARTER: { code: 'last_quarter', label: 'Last Quarter' }
}

const ACTION_TYPE = { VIEW: 'view', EDIT: 'edit' }
const defaultMessage = {
  msg: '',
  type: '',
  action: ACTION_TYPE.VIEW,
  loading: false,
  modalMsg: 'Save changes to the moon phases list?',
  openLoadingModal: false
}

const defaultUpdatedBy = {
  updated_by: '',
  date_created: ''
}

function MoonPhasesList () {
  const [state, setState] = useState([])
  const [message, setMessage] = useState(defaultMessage)
  const [log, setLog] = useState(defaultUpdatedBy)
  const [isViewInfo, setViewInfo] = useState(true)
  const mounted = useRef(false)

  // Initial moon phases data
  const [moonPhasesData, mLoading, mError] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_TENDAY_COMMON}/${_WeatherForecastGetter.COMMON_TENDAY_TYPE.MOON_PHASES}`)

  useEffect(() => {
    mounted.current = true

    // Initialize the moon phases local list with default values
    setState(Object.values(MOON_PHASE_TYPE).reduce((acc, phase, index) => {
      return [ ...acc, {
        id: index,
        value: '-',
        phase: phase.code,
        label: phase.label,
        image: `images/icons/moon/${phase.code}.svg`,
        isValid: false,
      } ]
    }, []))

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!mLoading && mounted.current && moonPhasesData) {
      // Initialize the moon phases local list
      resetState(moonPhasesData)

      /* eslint-disable no-unused-vars */
      setLog(prev => ({
        ...prev,
        updated_by: moonPhasesData.updated_by,
        date_created: getFirestoreDateTimeString(moonPhasesData.date_created)
      }))
    }

    // Display initial data loading error
    if (mError !== '' && mounted.current) {
      setMessage({ ...defaultMessage, msg: mError, type: MESSAGE_TYPE.ERROR})
    }
  }, [moonPhasesData, mLoading, mError, resetState])

  const resetState = useCallback((listData) => {
    if (listData) {
      const temp = [...state]

      listData.data.forEach((item, index) => {
        temp[index].value = item.value
        temp[index].isValid = (item.value !== '')
      })

      setState(prev => temp)
    }
  }, [state])

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
          temp[index].isValid = (value !== '')
        }
      }

      /* eslint-disable no-unused-vars */
      setState(prev => temp)
    }
  }

  const handleClearList = () => {
    setState(state.map(item => ({ ...item, isValid: false, value: '' })))
  }

  // Toggle the view/edit mode list UI
  const handleSwitchClick = (listData) => {
    if (!isViewInfo) {
      resetState(listData || moonPhasesData)
    }

    setViewInfo(prev => !prev)
  }

  const handleSaveClick = () => {
    if (state.find(item => item.value === '') !== undefined) {
      setMessage(prev => ({ ...prev, msg: 'Please check your input', type: MESSAGE_TYPE.INFO, openLoadingModal: false }))
      return
    }

    setMessage({ ...message, openLoadingModal: true })
  }

  const onSaveClick = async () => {
    if (!mounted.current) {
      return
    }

    try {
      setMessage({ ...defaultMessage, loading: true, openLoadingModal: true, modalMsg: 'Saving changes...' })

      const response = await updateCommonWeather({
        type: _WeatherForecastGetter.SUB_TENDAY_COMMON,
        body: {
          region: process.env.REGION_NAME,
          type: _WeatherForecastGetter.COMMON_TENDAY_TYPE.MOON_PHASES,
          data: state.map((item, id) => ({
            id,
            value: item.value,
            phase: item.phase
          })),
        }
      })

      if (mounted.current) {
        setMessage(prev => ({ ...defaultMessage, msg: 'Successfully saved changes', type: MESSAGE_TYPE.SUCCESS}))
        setLog(prev => ({
          ...prev,
          updated_by: response.updated_by,
          date_created: getTimestampDateTimeString(response.date_created)
        }))
        handleSwitchClick(response)
      }
    } catch (err) {
      if (mounted.current) {
        let errMsg = ''

        if (err.response !== undefined) {
          errMsg = err.response.data !== undefined ? err.response.data : ''
        }

        if (errMsg === '') {
          errMsg = err.message
        }

        setMessage({ ...defaultMessage, msg: errMsg, type: MESSAGE_TYPE.ERROR})
      }
    }
  }

  return (
    <MoonPhaseListComponent
      state={state}
      message={message}
      log={log}
      isDisabled={message.loading}
      isViewInfo={isViewInfo}
      handleInputChange={handleInputChange}
      handleClearClick={handleClearList}
      handleSaveClick={handleSaveClick}
      handleCancelSaveClick={() => setMessage(defaultMessage)}
      handleSwitchClick={() => handleSwitchClick(null)}
      onSaveClick={onSaveClick}
    />
  )
}

export default MoonPhasesList
