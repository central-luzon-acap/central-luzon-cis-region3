import { useEffect, useState } from 'react'

import { MONTH_LABELS, WEATHER_CONDITION_LABELS } from '@/utils/constants'

import {
  REPORT,
  REPORT_COMMON,
  REPORT_REGULAR,
  REPORT_SEASONAL,
  REPORT_TENDAY,
  REPORT_SPECIAL,
  MISC
} from './constants'

/**
 * Normalizes and formats a crop recommendation report's key-value pairs for seasonal, 10-day or special output
 * @param {Object} report - Report output from saving a bulletin PDF
 * @param {String[]} excludeFields - Keys to exclude from the formatted `report` object
 * @returns {Object} - Formatted report object
 */
export default function useReportFields(report, excludeFields = []) {
  const [fieldValues, setFieldValues] = useState([])

  const formatValue = (key, value) => {
    let formatted = ''

    switch (key) {
      // 6-months seasonal weather conditions
      case REPORT.CONDITIONS:
        for (let i = 0; i < (value ?? []).length; i += 1) {
          formatted += `${MONTH_LABELS[value[i]?.mo?.toUpperCase()]?.format}: `

          formatted +=
            Object.values(WEATHER_CONDITION_LABELS).find(
              (forecast) => forecast.label === value[i]?.con
            )?.sync ?? 'n/a'

          if (i < value.length - 1) {
            formatted += ', '
          }
        }
        break

      // 1-month seasonal weather condition
      case REPORT.CONDITION:
        formatted =
          Object.values(WEATHER_CONDITION_LABELS).find(
            (item) => item.label === value
          )?.sync || 'n/a'
        break

      // Default value
      default:
        formatted = value
        break
    }

    // Turn String arrays into comma-delimited values
    // Note: Only String fields are expected in the report field
    if (Array.isArray(formatted)) {
      formatted = formatted.toString().split(',').join(', ')
    }

    return formatted ?? 'n/a'
  }

  useEffect(() => {
    if (!report?.id) return
    if (fieldValues.length > 0) return

    let common = [...REPORT_COMMON]

    if (report[REPORT.TYPE] === 'seasonal') {
      common = [
        ...common,
        ...REPORT_REGULAR,
        ...REPORT_SEASONAL,
        ...MISC.USER_INFO
      ]
    }

    if (report[REPORT.TYPE] === 'ten_day') {
      common = [
        ...common,
        ...REPORT_REGULAR,
        ...REPORT_TENDAY,
        ...MISC.USER_INFO
      ]
    }

    if (report[REPORT.TYPE] === 'special_weather') {
      common = [...common, ...REPORT_SPECIAL, ...MISC.USER_INFO]
    }

    const edited = common
      .map((item, id) => ({
        ...item,
        id,
        value: formatValue(item.field, report?.[item.field])
      }))
      .filter(
        (item) =>
          !excludeFields.includes(item.field) &&
          !['-', 'n/a'].includes(item.value)
      )

    setFieldValues(edited)
  }, [report, excludeFields, fieldValues])

  return { fieldValues }
}
