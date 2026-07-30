import { useState, useEffect } from 'react'
import { getRangedMonths } from '@/utils/date'
import { CROP_STAGE_LABELS, CROP_STAGES_MONTH, STAGE_NONE } from '@/utils/constants/croppingcalendar'

/**
 * Extracts and formats the following objects from a municipal cropping calendar data and the latest 10-DAY weather forecast:
 * List of raw crop stages, unique crop stages and crops list select options for 1 or both (1st half, 2nd half) month "parts" of a start date, or a 10-day date range starting from the start date.
 * Return a list of enabled or disabled crops list
 * @param {Object[]} cropCalMunicipality - Cropping calendar data of a municipality for one or more crops
 * @param {Date} dateStart - Starting date JavaScript Date object to build detailed month(s) reference on the cropping calendar
 * @param {String[]} crops - Crops list following the format [{ id: 0, label: "some crop" },...]
 * @param {Bool} isTendayRange - Flag to include the endDate of a 10-day date range, starting from "dateStart" when processing crop stages in inclusive month halves
 * @returns {Object} { months, subcropstages, uniquecropstages }
 *    - cropslist: {Object[]} Process "crops" list with disabled/enabled crops selection options if it has a crop stage on a start date, or a 10-day date range starting from the start date.
 *    - cropstagesbycrop: {Object} unique crop stages list of a municipality per month, attached to a month code key,
 *      i.e.: { Rice: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...] }
 *    - uniquecropstages: {Object[]} Unique crop stages across all crops,
 *      i.e: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
 *    - error: {String} Data parsing errors
 */
export default function useCroppingCalendarTenday (cropCalMunicipality, dateStart, crops = [], isTendayRange = false) {
  const [cropslist, setCropsList] = useState([])
  const [cropstagesbycrop, setCropStages] = useState(null)
  const [uniquecropstages, setUniqueCropStages] = useState([])
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(null)
  const [error, setError] = useState('')

  const itemExists = (objList, item) => (objList.findIndex(stage => stage.code === item) >= 0)

  // Convert a JS date to YYYY/MM/DD format
  const getStringDate = (dateObject) => new Date(dateObject).toLocaleDateString()

  const resetData = () => {
    setCropsList([])
    setUniqueCropStages([])
    setCropStages(null)
    setLocation('')
    setDate(null)
  }

  useEffect(() => {
    setError('')

    if (cropCalMunicipality && dateStart && crops.length > 0 && cropCalMunicipality.length > 0) {
      const { municipality } = cropCalMunicipality[0]

      if (municipality === location && date === getStringDate(dateStart ?? null)) {
        return
      }

      // TO-DO: Investigate deep copy is not working (?)
      const cropsList = [ ...crops ]
      // resetData()

      // Fine-tune stages detection - include date range of applicable months(s)
      // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
      // with 1st half or 2nd half month details per inclusive month depending on the start date
      // of the date range's "start date"
      const dateRangeStart = new Date(dateStart)
      const months = getRangedMonths(dateRangeStart, isTendayRange)

      // Re-set unique crops list for [province-municipality] from the [Cropping Calendar]
      // Disable crops which has no available crop stages ("none") for the "current" part of selected month (1st half, 2nd half or both)
      try {
        // Crop stages per crop and month part(s)
        const tempStages = {}
        const uStages = []

        cropsList.forEach((crop) => {
          if (tempStages[crop.label] === undefined) {
            tempStages[crop.label] = []
          }

          let nostagecount = 0
          let totalstages = 0

          Object.keys(months).forEach(monthcode => {
            // Get the crop calendar for the current crop
            const cropCalendar = cropCalMunicipality.find(x => x.crop === crop.label)

            if (!cropCalendar) {
              throw new Error(`Cannot find cropping calendar for ${crop.label}`)
            }

            // Get the month's crop calendar data for the current crop
            const monthStages = cropCalendar[monthcode]

            if (monthStages === undefined || monthStages === '') {
              throw new Error(`Crop stages data for ${monthcode} does not exist.`)
            }

            // Stages per month always contain (2) stages, separated by comma
            const stages = monthStages.split(',')

            // Look-up each month part detail (1st half, 2nd half or both) for STAGE_NONE
            // Set crop to disabled if one or both month part detail is STAGE_NONE
            for (let i = 0; i < months[monthcode].length; i += 1) {
              if (months[monthcode][i] === CROP_STAGES_MONTH.FIRST_HALF) {
                // crop.disabled = (stages[0] === STAGE_NONE)
                totalstages += 1

                if (stages[0] !== STAGE_NONE) {
                  const entry = {
                    id: tempStages[crop.label].length,
                    label: CROP_STAGE_LABELS[stages[0]],
                    code: stages[0],
                    municipality: cropCalendar.municipality
                  }

                  tempStages[crop.label].push(entry)

                  if (!itemExists(uStages, stages[0])) {
                    uStages.push(entry)
                  }
                } else {
                  nostagecount += 1
                }
              } else if (months[monthcode][i] === CROP_STAGES_MONTH.SECOND_HALF) {
                // crop.disabled = (stages[1] === STAGE_NONE)
                totalstages += 1

                if (stages[1] !== STAGE_NONE) {
                  const entry = {
                    id: tempStages[crop.label].length,
                    label: CROP_STAGE_LABELS[stages[1]],
                    code: stages[1],
                    municipality: cropCalendar.municipality
                  }

                  tempStages[crop.label].push(entry)

                  if (!itemExists(uStages, stages[1])) {
                    uStages.push(entry)
                  }
                } else {
                  nostagecount += 1
                }
              }
            }
          })

          // All stages are STAGE_NONE
          crop.disabled = (nostagecount === totalstages)
        })

        setLocation(municipality)
        setCropStages(tempStages)
        setCropsList(cropsList)
        setUniqueCropStages(uStages)
        setDate(getStringDate(dateStart))
      } catch (err) {
        resetData()
        setError(err.message)
      }
    }

    if (cropCalMunicipality.length === 0) {
      resetData()
    }
  }, [cropCalMunicipality, dateStart, date, crops, location, isTendayRange])

  return { cropslist, cropstagesbycrop, uniquecropstages, error }
}
