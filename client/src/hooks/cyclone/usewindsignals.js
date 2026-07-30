import { useState, useEffect } from 'react'
import { WIND_SIGNAL, WIND_SIGNAL_CODES } from '@/utils/constants'

const defaultWindSignals = [
  { id: 0, label: WIND_SIGNAL.general_no_signal, value: 0, code: WIND_SIGNAL_CODES.SIGNAL_0, disabled: false },
  { id: 1, label: WIND_SIGNAL.signal_number_1, value: 1, code: WIND_SIGNAL_CODES.SIGNAL_1, disabled: true },
  { id: 2, label: WIND_SIGNAL.signal_number_2, value: 2, code: WIND_SIGNAL_CODES.SIGNAL_2, disabled: true },
  { id: 3, label: WIND_SIGNAL.signal_number_3, value: 3, code: WIND_SIGNAL_CODES.SIGNAL_3, disabled: true },
  { id: 4, label: WIND_SIGNAL.signal_number_4, value: 4, code: WIND_SIGNAL_CODES.SIGNAL_4, disabled: true },
  { id: 5, label: WIND_SIGNAL.signal_number_5, value: 5, code: WIND_SIGNAL_CODES.SIGNAL_5, disabled: true }
]

/**
 * Returns a list of disabled/enabled wind signals (1-5) items for dropdown menu selection options
 * @param {Object} cycloneData - Web-scraped tropical cyclone data
 * @param {Bool} isCycloneLoading - Flag indicating the cyclone data fetch loading status
 * @returns {Object[]} - Object array list of disabled/enabled wind signals (1-5) items
 */
export default function useWindSignals (cycloneData, isCycloneLoading = true) {
  const [windSignals, setWindSignals] = useState([])
  const [typhoon, setTyphoon] = useState(null)

  useEffect(() => {
    if (!isCycloneLoading) {

      if ((cycloneData ?? []).length === 0) {
        setWindSignals(defaultWindSignals)
      } else {
        const signals = cycloneData?.data?.signal?.map(item => item.number)

        // Set the typhoon name
        setTyphoon(cycloneData?.data?.meta?.typhoon_name)

        // Set the wind signals list
        setWindSignals(defaultWindSignals.map((item) => {
          return {
            ...item,
            disabled: item.value === 0
              ? false
              : !signals.includes(item.value)
          }
        }))
      }
    }
  }, [cycloneData, isCycloneLoading])

  return { windSignals, typhoon }
}
