import { useState, useEffect } from 'react'
import { MONTH_LABELS } from '@/utils/constants'

/**
 * Convert a municipality's cropping calendar stages to CSS codes for data visualization
 * @param {String} cropCalProvince - Cropping calendar data of a province
 * @returns {Object[]} List if unique crops in [{ id, label, disabled },...] format. Each crop is disabled: false by default.
 *    - stagesforviz: {Object} Contains month codes as keys with an array of max (2) normalized crop stages codes for the cropping calendar data visualization
 *    - error: {String} Processing errors
 */
export default function useCroppingCalendarViz(
  cropCalMunicipality,
  cropStages,
) {
  const [stagesforviz, setProcessedStages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')

    if (cropCalMunicipality.length > 0) {
      try {
        const processed1 = Object.values(MONTH_LABELS).reduce((list, month) => {
          return {
            ...list,
            ...{
              [month.code]: cropCalMunicipality[0][month.code]
                .split(',')
                .map((stage) => {
                  return stage === 'none'
                    ? 'cropCalnocolor'
                    : `cropCal${cropStages[stage].index}`
                }),
            },
          }
        }, {})

        const processed2 = Object.values(MONTH_LABELS).reduce((list, month) => {
          return {
            ...list,
            ...{
              [month.code]: cropCalMunicipality[1][month.code]
                .split(',')
                .map((stage) =>
                  stage === 'none'
                    ? 'cropCalnocolor'
                    : `cropCal${cropStages[stage].index}`,
                ),
            },
          }
        }, {})

        setProcessedStages([processed1, processed2])
      } catch (err) {
        setError(err.message)
      }
    } else {
      // Reset previous viz data
      setProcessedStages([])
    }
  }, [cropCalMunicipality, cropStages])

  return { stagesforviz, error }
}
