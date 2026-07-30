const { useEffect, useState, useRef } = require('react')
import SpecialWeather from './specialweather'
import { _Utilities } from '@/services/utilities/utilities'
import { updateSpecialWeather } from '@/services/special_weather'
import { useDocument } from '@/hooks/usefirestore'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'

const defaultState = {
  loading: false, error: '', msg: '', updated_by: '', date_updated: '', summary: ''
}

function SpecialWeatherContainer ({ getDateToString }) {
  const [cyclone, cycloneLoading, cycloneError] = useDocument(_Utilities.GLOBAL_COLLECTIONS, _Utilities.CYCLONE_ADVISORY)
  const [state, setState] = useState(defaultState)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!cycloneLoading) {
      if (!mounted.current) {
        return
      }

      if (cycloneError) {
        setState({ error: cycloneError })
      } else {
        setState({
          loading: false,
          error: '',
          msg: '',
          updated_by: (cyclone.updated_by === 'system')
            ? 'system' : cyclone.email,
          date_updated: getDateToString(cyclone.date_updated),
          summary: cyclone.summary
        })
      }
    }
  }, [cycloneLoading, cyclone, cycloneError, getDateToString])

  const handleUpdateClick = async () => {
    try {
      setState({ ...state, loading: true, error: '', msg: '' })
      const data = await updateSpecialWeather({})
      const dateUpdated = new Date(data.date_updated._seconds * 1000)
      data.date_updated = `${dateUpdated.toDateString()} ${dateUpdated.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`

      if (mounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          msg: 'Successfully synced data.',
          updated_by: (data.updated_by === 'system')
              ? 'system' : data.email,
          date_updated: data.date_updated,
          summary: data.summary
        }))
      }
    } catch (err) {
      if (mounted.current) {
        setState(prev => ({ ...prev, loading: false, error: err.message }))
      }
    }
  }

  return (
    <SpecialWeather
      state={state}
      cycloneLoading={cycloneLoading}
      onSyncPress={handleUpdateClick}
    />
  )
}

export default SpecialWeatherContainer
