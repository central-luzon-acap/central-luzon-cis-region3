import { useState, useEffect, useCallback } from 'react'
import { upsertTenDay } from '@/services/weatherforecast'
import { useNestedCollectionWithQuery } from '@/hooks/usefirestore'
import { getTenDayStats } from '@/services/weatherforecast_getter'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import TenDayWeatherPanel from './tenpanel'

const defaultStatus = { loading: false, error: '', msg: '' }
const defaultLogs = { updated_by: '', date_forecast: '', date_synced: '', date_valid: '' }

function TenDayWeatherContainer ({ getDateToString }) {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState(defaultStatus)
  const [currentLogs, setCurrentLogs] = useState(defaultLogs)
  const { documents, loading, error } = useNestedCollectionWithQuery(
    _WeatherForecastGetter.WEATHER_FORECASTS, process.env.REGION_NAME, 'ten_day', 'name', 1)

  // Format the fetched data for display
  useEffect(() => {
    if (!loading && error === '' && documents.length > 0) {
      formatData(documents)
    }
  }, [loading, error, documents, formatData])

  const formatData = useCallback((data) => {
    const temp = Object.values(data[0].municipalities)[0][0]
    const obj = {
      updated_by: data[0].updated_by,
      date_synced: getDateToString(data[0].date_created)
    }
    obj.date_forecast = temp.date_forecast
    obj.date_valid = temp.date_range
    setCurrentLogs(obj)
  }, [getDateToString])

  const handleSelectFiles = (e) => {
    setStatus(defaultStatus)
    setFiles(e.target.files)
  }

  const handleSubmit = async () => {
    const formData = new FormData()

    for (let i = 0; i < files.length; i += 1) {
      formData.append('excel-files', files[i])
    }

    try {
      setStatus({ ...defaultStatus, loading: true })
      await upsertTenDay(formData)
      /* eslint-disable no-unused-vars */
      setStatus(prev => ({ ...defaultStatus, loading: false, msg: 'Upload success.' }))
    } catch (err) {
      const errMsg = err.response ? err.response.data : err.message
      setStatus({ ...defaultStatus, loading: false, error: errMsg })
      return
    }

    try {
      // Fetch updated data
      const data = await getTenDayStats()
      formatData(data)
    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <TenDayWeatherPanel
      files={files}
      status={status}
      logs={currentLogs}
      handleSubmit={handleSubmit}
      handleSelectFiles={handleSelectFiles}
    />
  )
}

export default TenDayWeatherContainer
