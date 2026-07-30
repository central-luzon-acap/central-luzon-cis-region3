import { useState, useEffect } from 'react'
import { getCropList } from '@/services/crop_calendar'

export default function useFetchCrops() {
  const [cropList, setCropList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const cropListData = await getCropList()
        setCropList(cropListData?.list ?? [])


        setLoading(false)
        setError('')

      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
        setCropList([])
      }
    }

    load()
  }, [])

  return { cropList, loading, error }
}