import { useState, useEffect } from 'react'

import { getSupportServices } from '@/services/support_services'

export default function useSupportServices(service, isLoading) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const supportServices = await getSupportServices()

        setServices(supportServices ?? [])
      } catch (err) {
        let errMsg = err?.response?.data ?? err.message
        setError(errMsg)
        setLoading(false)
      }
    }

    load()
  }, [service, isLoading])

  return { services, loading, error }
}
