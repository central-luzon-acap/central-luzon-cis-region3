import { useEffect, useState, useMemo } from 'react'

import { getRangedMonths } from '@/utils/date'

import { STAGE_NONE } from '@/utils/constants/croppingcalendar'
import { CROP_STAGES_MONTH } from '@/utils/constants'

/**
  * Checks if a set of crop stages for a month from a set of masterlist crop stages is valid
  * @param {String[]} stagesCodeSet - String list of crop stage codes per month, containing max two (2) crop stage codes
  *    - i.e., `['plant', 'lprep']`, `['none', 'plant']`,...
  * @param {Object} allStages - Object masterlist of all cropping calendar stages for a specific crop
  *    - Retrieved from `this.getcropcalstagesdataV2()`
  *    - Follows the format:
  *    ```
  *    {
  *      mat: { code: 'mat', index: 6, label: 'Maturing' },
  *      plant: { code: 'plant', index: 2, label: 'Newly Planted' },
  *      prep: { code: 'prep', index: 0, label: 'Preparation Stage' },
  *      ...
  *    }
  *    ```
  * @returns {Bool} Flag if the set of crop stages per month is valid
  * @throws {Error} Parsing and validation errors
  */
export const isValidCropStageSet = (stagesCodeSet, allStages) => {
  let isValid = true

  if (!allStages) {
    throw new Error('Missing crop stages masterlist')
  }

  // Crop stages per month has entries for the 1st and 2nd month halves
  if (stagesCodeSet.length < 2) return false

  for (let i = 0; i < stagesCodeSet.length; i += 1) {
    // Crop stages should not be an empty String or null/undefined
    if (stagesCodeSet[i] === '' || !stagesCodeSet[i]) {
      isValid = false
      break
    }

    // Skip checking "none" crop stage
    if (stagesCodeSet[i] === STAGE_NONE) continue

    // Each crop stage should have a definition in the crop stages masterlist
    if (!allStages[stagesCodeSet[i]]) {
      isValid = false
      break
    }

    // Crop stage should have a descriptive label
    if (!allStages[stagesCodeSet[i]].label) {
      isValid = false
      break
    }
  }

  return isValid
}

/**
 * Extracts and formats cropping calendar objects from a province cropping calendar v2 data and the latest 10-DAY weather forecast:
 * List of ordered, unique crop stages for 1 or both (1st half, 2nd half) month "parts" of a start date, or a 10-day date range starting from the start date in order from their occurrence in the cropping calendar.
 * Return a list of enabled or disabled crops list
 * @param {Object} calendarProvince - Raw cropping calendar v2 data of a province for only one (1) crop. Follows the format:
 *    - `{ data1[], data2[] }`
 *    - The `data1` and `data2` keys are Object[] arrays containing crop stage codes whose items follow the format: `{ municipality, crop, jan: "prep,mat", feb: "none,veg",..., dec: "repro,veg" }`
 * @param {String} municipality - Municipality name
 * @param {String} dateStart - Starting date JavaScript Date object to build detailed month(s) reference on the cropping calendar
 * @param {String} crop - Crop name
 * @param {Bool} isTendayRange - Flag to include the endDate of a 10-day date range, starting from "dateStart" when processing crop stages in inclusive month halves
 * @param {Object} allStages - Key-value pairs containing a masterlist of all valid crop stages for a certain crop
 * @returns {Object} { months, subcropstages, uniquecropstages }
 *    - uniquecropstages: {Object[]} Unique crop stages across all crops,
 *      i.e: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
 *    - error: {String} Data parsing errors
 */
export default function useCroppingCalendarTendayV2 ({
  calendarProvince = null,
  municipality = null,
  dateStart = null,
  crop = null,
  isTendayRange = false,
  allStages = null
}) {
  const [uniquecropstages, setUniqueCropStages] = useState([])
  const [error, setError] = useState('')

  const resetData = () => {
    setUniqueCropStages([])
    setError('')
  }

  const months = useMemo(() => {
    // Fine-tune stages detection - include date range of applicable months(s)
    // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
    // with 1st half or 2nd half month details per inclusive month depending on the start date
    // of the date range's "start date"
    const dateRangeStart = new Date(dateStart)
    return getRangedMonths(dateRangeStart, isTendayRange)
  }, [dateStart, isTendayRange])

  useEffect(() => {
    resetData()

    if (calendarProvince) {
      // calendarProvince/allStages defaults to Array, but their expected values are Objects
      if (Array.isArray(calendarProvince)) return
      if (Array.isArray(allStages)) return

      if (
        calendarProvince.data1[0].crop !== crop ||
        calendarProvince.data2[0].crop !== crop
      ) return

      // console.log('>>>> PROCESSING 10-DAY CALENDAR')

      try {
        const calendar1 = calendarProvince.data1.find(calendar => calendar.municipality === municipality)
        const calendar2 = calendarProvince.data2.find(calendar => calendar.municipality === municipality)

        if (!calendar1 || !calendar2) {
          throw new Error('Cannot find cropping calendar')
        }

        let nostagecount = 0
        let totalstages = 0
        const uniqueStages = []

        const STAGE_INDEX = {
          [CROP_STAGES_MONTH.FIRST_HALF]: 0,
          [CROP_STAGES_MONTH.SECOND_HALF]: 1
        }

        // Generates a valid (no "none" stage) `uniquecropstages` and `stagespercrop` object
        const generateValidEntry = (stageCode, location, monthPart) => {
          if (stageCode === STAGE_NONE) return

          const entry = {
            id: uniqueStages.length,
            label: allStages[stageCode].label,
            code: stageCode,
            municipality: location,
            part: monthPart
          }

          if (!(uniqueStages.findIndex(stage => stage.code === stageCode) >= 0)) {
            uniqueStages.push(entry)
          }
        }

        for (let monthcode in months) {
          // Get the month's crop calendar data for the current crop
          const monthStages = calendar1[monthcode]
          const monthStages2 = calendar2[monthcode]
          const monthStagesString = `${monthStages ?? ''}${monthStages2 ?? ''}`

          if (monthStagesString === '') {
            throw new Error(`Crop stages data for ${monthcode} does not exist.`)
          }

          // Validate crop stages
          // Stages per month always contain (2) stages, separated by comma
          const stages1 = monthStages.split(',')
          const stages2 = monthStages2.split(',')

          if (
            !isValidCropStageSet(stages1, allStages) ||
            !isValidCropStageSet(stages2, allStages)
          ) {
            throw new Error(`Invalid set of crop stages for month: ${monthcode}`)
          }

          for (let i = 0; i < months[monthcode].length; i += 1) {
            let stageIndex = STAGE_INDEX[months[monthcode][i]]
            totalstages += 1

            generateValidEntry(stages1[stageIndex], calendar1.municipality, `${monthcode} - ${months[monthcode][i]}`)
            generateValidEntry(stages2[stageIndex], calendar2.municipality, `${monthcode} - ${months[monthcode][i]}`)

            if (stages1[stageIndex] === STAGE_NONE && stages2[stageIndex] === STAGE_NONE) {
              nostagecount += 1
            }
          }
        }

        if (nostagecount === totalstages) {
          throw new Error('No crop stages are available')
        }

        setUniqueCropStages(uniqueStages)
      } catch (err) {
        resetData()
        setError(err.message)
      }
    }
  }, [calendarProvince, municipality, allStages, crop, months])

  return {
    uniquecropstages,
    error
  }
}
