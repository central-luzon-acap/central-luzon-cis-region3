import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCommonMiscWeather,
  upsertCommonMiscWeather
} from '@/store/weather_common/seasonal/miscsystemsThunks'
import { ADAPTER_STATES } from '@/store/constants'
import MiscSystemsListComponent from './misc_systems'

const MAX_STR_LENGTH = 30
const MAX_ITEMS = 25

const msgTypes = { success: 'success', error: 'error', info: 'info' }
const defaultMessages = { msg: '', type: '', modalMsg: 'Save changes to the weather systems list?', openLoadingModal: false }

function MiscSystemsList () {
  const [state, setState] = useState([])
  const [message, setMessages] = useState(defaultMessages)
  const [pageInitialized, setPageInitialized] = useState(false)
  const dispatch = useDispatch()
  const mounted = useRef(false)

  const {
    ids: scIds,
    entities: miscWeatherData,
    status: scLoading,
    updated_by,
    date_created
  } = useSelector((state) => state.seasonalcommon_misc)

  // Fetch saved data and initialize page
  useEffect(() => {
    mounted.current = true

    dispatch(fetchCommonMiscWeather())
      .unwrap()
      .then(() => {
        if (mounted.current) {
          setPageInitialized(true)
        }
      })

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [dispatch])

  useEffect(() => {
    if (scLoading === ADAPTER_STATES.FULLFILLED && scIds.length > 0 && pageInitialized) {
      resetValues()
    }
  }, [scLoading, scIds, pageInitialized, resetValues])

  // Initialize the misc weather systems list with default values
  const resetValues = useCallback(() => {
    if (!mounted.current) {
      return
    }

    /* eslint-disable no-unused-vars */
    setMessages(prev => defaultMessages)
    setState(prev => Object.values(miscWeatherData).map(item => ({
      ...item,
      isValid: true
    })))
  }, [miscWeatherData])

  // Handle input change
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

        if (value.length >= MAX_STR_LENGTH) {
          temp[index].isValid = false
        } else {
          temp[index].isValid = (value !== '')
        }
      }

      /* eslint-disable no-unused-vars */
      if (mounted.current) {
        setState(prev => temp)
      }
    }
  }

  // Delete an item from the local list
  const handleDeleteClick = (id) => {
    if (!mounted.current) {
      return
    }

    setState(prev => state.reduce((acc, item, index) => {
      if (index !== id) {
        acc = [...acc, item]
      }

      return acc
    }, [])
      .map((record, index) => ({
        ...record,
        id: index
      }))
    )
  }

  // Add a blank item to the local list
  const handleAddClick = () => {
    if (state.length === MAX_ITEMS || !mounted.current) {
      return
    }

    const temp = [...state]
    temp.push({ id: temp.length, value: '' })
    setState(temp)
  }


  // Handle the save action
  const handleSaveClick = () => {
    if (!mounted.current) {
      return
    }

    if (state.find(item => item.value === '') !== undefined) {
      setMessages(prev => ({ ...prev, msg: 'Please check your input', type: msgTypes.info, openLoadingModal: false }))
      return
    }

    setMessages({ ...message, modalMsg: 'Saving...' })

    dispatch(upsertCommonMiscWeather(state))
      .unwrap()
      .then(() => {
        if (mounted.current) {
          setMessages(prev => ({ ...defaultMessages, msg: 'Successfully saved changes.', type: msgTypes.success }))
        }
      })
      .catch(err => {
        if (mounted.current) {
          setMessages(prev => ({ ...defaultMessages, msg: err, type: msgTypes.error }))
        }
      })
  }

  return (
    <MiscSystemsListComponent
      state={state}
      message={message}
      log={{updated_by, date_created}}
      isLoading={scLoading === ADAPTER_STATES.PENDING}
      handleInputChange={handleInputChange}
      handleClearClick={() => setState([])}
      handleDeleteClick={handleDeleteClick}
      handleReset={resetValues}
      handleAddClick={handleAddClick}
      handleSaveClick={() => setMessages({ ...message, openLoadingModal: true })}
      handleCancelSaveClick={() => setMessages({ ...message, openLoadingModal: false })}
      handleResetMsg={() => setMessages(defaultMessages)}
      onSaveClick={handleSaveClick}
    />
  )
}

export default MiscSystemsList
