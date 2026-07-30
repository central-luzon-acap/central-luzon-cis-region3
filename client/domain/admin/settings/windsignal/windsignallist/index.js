import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDocument } from '@/hooks/usefirestore'
import { municipalitiesReceived } from '@/store/municipalities/municipalitySlice'
import { updateCommonWeather } from '@/services/weatherforecast'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { getFirestoreDateTimeString, getTimestampDateTimeString } from '@/utils/date'
import { APP_STATES, MSG_TYPES } from '@/utils/constants/app'
import WindSignalListComponent from './windsignallist'
import { ADAPTER_STATES } from '@/store/constants'
import useProvinces from '@/hooks/provinces/useprovinces'

const MAX_STR_LENGTH = 2
const MAX_ITEMS = 5
const MAX_WIND_SIGNAL = 10

const defaultItem = { id: -1, signal: -1, province: null, municipalities: [] }
const defaultMessages = { MSG: '', TITLE: '', TYPE: '', MODAL_MSG: '', openLoadingModal: false, saving: false }

const DIALOG_MESSAGES = {
  [APP_STATES.SAVE]: {
    TITLE: 'Save changes',
    MSG: 'Save changes to the wind speed list?',
    SUCCESS: 'Changes saved.'
  },
  [APP_STATES.SAVING]: {
    TITLE: 'Save changes',
    MSG: 'Saving data...',
    SUCCESS: 'Changes saved.'
  },
  [APP_STATES.EDIT]: {
    TITLE: 'Affected Provinces and Municipalities Form',
    MSG: '',
    SUCCESS: 'Changes saved.'
  }
}

function WindSignalList () {
  const { ids: idsP, entities: provincesData, status: pLoading, municipalities } = useSelector((state) => state.provinces)
  const [windsignalitems, setWindspeedItems] = useState([])
  const [message, setMessages] = useState(defaultMessages)
  const [state, setState] = useState([])
  const [currentItem, setCurrentItem] = useState(defaultItem)
  const [appState, setAppState] = useState(APP_STATES.VIEW)
  const [updatedByInfo, setUpdatedByInfo] = useState('')
  /* eslint-disable no-unused-vars */
  const [currentRowIndex, setRowIndex] = useState(-1)
  const dispatch = useDispatch()
  const mounted = useRef(false)

  // Fetch provinces if they're not yet loaded
  useProvinces()

  // Initial wind signal data
  const [windSignalData, wLoading, wError] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_SPECIAL_COMMON}/${_WeatherForecastGetter.COMMON_SPECIAL_TYPE.WIND_SPEED}`)

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    // Initialize data on first page load
    if (!wLoading && pLoading === ADAPTER_STATES.FULLFILLED) {
      initializeData()
    }
  }, [idsP, wLoading, pLoading, wError, initializeData])

  const initializeData = useCallback(() => {
    // Construct the main state data - masterlist of unique wind signals (value)
    const temp = windSignalData.data
      .map((item) => item.value)
      .filter((x, i, a) => a.indexOf(x) === i)
      .map((item, index) => ({
        id: index,
        value: item.toString(),
        isValid: true,
        full: 'Wind Signal'
      }))

    // Construct the list data
    const templist = windSignalData.data.map((item, id) => ({
      id,
      signal: item.value,
      province: Object.values(provincesData).find(x => x.label === item.province),
      municipalities: item.municipalities.map((x, id) => ({
        id,
        label: x
      }))
    }))

    if (mounted.current) {
      setWindspeedItems(templist)
      setState(temp)
      setUpdatedByInfo(`Updated by ${windSignalData.updated_by} on ${getFirestoreDateTimeString(windSignalData.date_created)}`)
    }
  }, [windSignalData, provincesData])

  // Handle the province and municipalities item selection
  const handleLocationItemChange = (e) => {
    const { id, value, signal } = e.target

    if (value === undefined || value === null) {
      switch(id) {
        case 'province':
          setCurrentItem(defaultItem)
          break
        case 'municipalities':
          break
        default: break
      }
      return
    }

    if (id === 'province') {
      const province = value.label

      // Use existing items
      const existing_mlist = windsignalitems
        .filter(item => item.province.label === province && item.signal === parseInt(signal))

      if (existing_mlist.length === 1) {
        setCurrentItem(existing_mlist[0])
      } else {
        setCurrentItem({
          ...defaultItem,
          id: windsignalitems.length,
          signal: parseInt(signal), province: {...value}
        })
      }

      // Set municipalities for the selected province
      dispatch(municipalitiesReceived(municipalities[province]))
    }

    if (id === 'municipalities') {
      setCurrentItem(prev => ({ ...prev, municipalities: value }))
    }
  }

  // Check data for duplicate municipalities
  const hasDuplicates = (signal) => {
    let duplicates = false

    for (let i = 0; i < windsignalitems.length; i += 1) {
      if (windsignalitems[i].province.label === currentItem.province.label &&
        windsignalitems[i].signal !== currentItem.signal
      ) {
        const temp = windsignalitems[i].municipalities.map(x => x.label)

        if (currentItem.municipalities.map(x => x.label).some(y => temp.indexOf(y) >= 0)) {
          duplicates = true
          break
        }
      }
    }

    return duplicates
  }

  // Handles the CONFIRM button press on the provinces/municipalities selection modal
  // Sorts the new/deleted items into their new storage locations
  const handleModalConfirmClick = (signal) => {
    const items = [...windsignalitems]

    if (currentItem.province === null) {
      return
    }

    // Province-municipality combo should be unique per wind signal group
    if (hasDuplicates(signal)) {
      /* eslint-disable no-unused-vars */
      setMessages(prev => ({
        ...defaultMessages,
        MSG: 'One or more of your selected municipalities have duplicates.',
        TYPE: MSG_TYPES.INFO,
        openLoadingModal: true
      }))

      setCurrentItem(defaultItem)
      return
    }

    // Get reference if existing
    const index = windsignalitems
      .findIndex(item => item.signal === parseInt(signal) && item.province.label === currentItem.province.label)

    if (index === -1) {
      // Create new entry
      const obj = {
        id: windsignalitems.length,
        signal: parseInt(signal),
        province: currentItem.province,
        municipalities: [...currentItem.municipalities]
      }

      items.push(obj)
      const newItems = [{...obj, municipalities: obj.municipalities }]
      setWindspeedItems(prev => [...prev, ...newItems])
    } else {
      // Update existing
      items[index].municipalities = [...currentItem.municipalities]

      /* eslint-disable no-unused-vars */
      setWindspeedItems(prev => items)
    }

    // Reset the current item
    setCurrentItem(defaultItem)
  }

  // Handles the CANCEL button press on the parent modal
  // Resets the current item and hides the modal
  const handleModalCancelClick = () => {
    setCurrentItem(defaultItem)
    setMessages(prev => ({ ...prev, openLoadingModal: false }))
  }

  // Handle the wind speed text input
  const handleInputChange = (e, action = 'update') => {
    const { id, value } = e.target
    const index = id.split('-')[1]
    const temp = [...state]

    if (temp[index]) {
      if (action === 'clear') {
        temp[index].value = ''
        temp[index].isValid = false
      } else {
        // Check for duplicates
        if (value !== '') {
          if (state.find(item => item.value === value) !== undefined) {
            temp[index].isValid = false
            return
          }
        }

        const prevValue = {...temp[index]}
        temp[index].value = value

        if (value.length > MAX_STR_LENGTH || isNaN(value) || value > MAX_WIND_SIGNAL) {
          temp[index].isValid = false
        } else {
          temp[index].isValid = (value !== '')

          if (value === '') {
            // Delete blank-ed signal
            handleDeleteClick(id, prevValue.value)
          }
        }
      }

      /* eslint-disable no-unused-vars */
      if (mounted.current) {
        setState(prev => temp)
      }
    }
  }

  // Add a blank item to the local list
  const handleAddClick = () => {
    if (state.length === MAX_ITEMS || !mounted.current) {
      return
    }

    const temp = [...state]
    temp.push({ id: temp.length, value: '', full: 'Wind Signal' })
    setState(temp)
  }

  // Delete a province and all its municipalities under a wind signal
  const handleDeleteProvince = (signal, province) => {
    const dState = [...windsignalitems]

    for (let i = 0; i < dState.length; i += 1) {
      if (dState[i].signal === parseInt(signal) && dState[i].province.label === province) {
        for (let j = 0; j < dState[i].municipalities.length; j += 1) {
          dState[i].municipalities[j] = null
        }

        dState[i].province = null
        dState[i] = null
      }
    }

    setWindspeedItems(prev => dState
      .filter(item => item !== null)
      .map((item, index) => ({
        ...item,
        id: index
      })))
  }

  // Delete an item via wind signal from the local list
  const handleDeleteClick = (id, signal) => {
    if (!mounted.current) {
      return
    }

    const temp = [...windsignalitems]

    for (let i = 0; i < temp.length; i += 1) {
      if (temp[i].signal === parseInt(signal)) {
        for (let j = 0; j < temp[i].municipalities.length; j += 1) {
          temp[i].municipalities[j] = null
        }

        temp[i].province = null
        temp[i] = null
      }
    }

    setWindspeedItems(prev => temp
      .filter(item => item !== null)
      .map((item, index) => ({
        ...item,
        id: index
      })))

    const tState = [...state]
    tState[id] = null
    tState.splice(id, 1)

    setState(prev => tState.map((item, index) => ({
      ...item,
      id: index
    })))
  }

  // Clear all data content on UI only
  const handleClearClick = () => {
    setState([])
    setWindspeedItems([])
  }

  // Initialize the misc weather systems list with default values to its last known "good" state
  const resetValues = () => {
    if (!mounted.current) {
      return
    }

    initializeData()
  }

  // Handle the save action
  const handleSaveClick = async () => {
    if (state.find(item => item.value === '') !== undefined ||
      state.find(item => item.isValid === false) !== undefined
    ) {
      setMessages(prev => ({ ...defaultMessages, MSG: 'Please check your input', TYPE: MSG_TYPES.INFO, openLoadingModal: !prev.openLoadingModal }))
      return
    }

    if (// windsignalitems.length === 0 ||
      // Item has municipalities
      windsignalitems.filter(item => item.municipalities.length === 0).length > 0 ||
      // Unique wind signal count matches with the masterlist count in state
      windsignalitems.map(item => item.signal).filter((x, i, a) => a.indexOf(x) === i).length !== state.length
    ) {
      setMessages(prev => ({ ...defaultMessages, MSG: 'Please check your input', TYPE: MSG_TYPES.INFO, openLoadingModal: !prev.openLoadingModal }))
      return
    }

    try {
      // Upload the wind signal information
      setMessages(prev => ({ ...prev, MODAL_MSG: 'Saving data...', saving: true }))

      const response = await updateCommonWeather({
        type: _WeatherForecastGetter.SUB_SPECIAL_COMMON,
        body: {
          data: windsignalitems.map(item => ({
            ...item,
            value: item.signal,
            province: item.province.label,
            municipalities: item.municipalities.map(x => x.label)
          })),
          region: process.env.REGION_NAME,
          type: _WeatherForecastGetter.COMMON_SPECIAL_TYPE.WIND_SPEED
        }
      })

      if (mounted.current) {
        setMessages(prev => ({ ...defaultMessages, MSG: 'Data successfully saved.', TYPE: MSG_TYPES.SUCCESS, openLoadingModal: !prev.openLoadingModal, saving: false }))
        setUpdatedByInfo(prev => `Updated by ${response.updated_by} on ${getTimestampDateTimeString(response.date_created)}`)
      }
    } catch (err) {
      if (mounted.current) {
        setMessages({ ...defaultMessages, MSG: err.message, TYPE: MSG_TYPES.ERROR, openLoadingModal: false, saving: false })
      }
    }
  }

  return (
    <WindSignalListComponent
      state={state}
      appstate={appState}
      message={message}
      windsignalitems={windsignalitems}
      updateinfo={updatedByInfo}
      onConfirmClick={handleModalConfirmClick}
      onCancelClick={handleModalCancelClick}
      onLocationItemChange={handleLocationItemChange}
      handleInputChange={handleInputChange}
      handleAddClick={handleAddClick}
      handleClearClick={handleClearClick}
      handleDeleteClick={handleDeleteClick}
      handleDeleteProvince={handleDeleteProvince}
      handleReset={resetValues}
      handleSaveClick={handleSaveClick}
      handleAppState={(APPSTATE, rowIndex) => {
        setRowIndex(prev => rowIndex ?? -1)
        setAppState(prev => APPSTATE)
        setMessages(prev => ({ ...prev, MSG: '', MODAL_MSG: DIALOG_MESSAGES[APPSTATE].MSG, TITLE: DIALOG_MESSAGES[APPSTATE].TITLE, openLoadingModal: true }))
      }}
      currentItem={currentItem}
    />
  )
}

export default WindSignalList
