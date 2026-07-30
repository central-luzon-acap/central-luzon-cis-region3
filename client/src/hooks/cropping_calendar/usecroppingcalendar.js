import { useState, useEffect } from 'react'
import { CROP_STAGE_LABELS, CROP_STAGES_MONTH, STAGE_NONE } from '@/utils/constants/croppingcalendar'

/**
 * Extracts and formats the following objects from a provincial cropping calendar data and the latest SEASONAL weather forecast:
 * List of (6) monthly raw crop stages, unique crop stage select options and months list select options
 * Return a list of enabled or disabled current (6) seasonal months list selection options
 * @param {Object} cropCalMunicipality - Cropping calendar data of a municipality
 * @param {Object[]} seasonalMonths - List of the default seasonal months (code) in [{ id: "jan", label: "January", disabled: false },...] format
 * @param {String} crop - Crop name
 * @returns {Object} { months, subcropstages, uniquecropstages }
 *    - subcropstages: {Object[]} detailed and formatted (6) months crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of month,
 *      i.e.: [{ id: 0, month: 'jan', 1st_half: 'Maturing', 2nd_half: 'Maturing' }...]
 *    - uniquecropstages: {Object} unique crop stages list of a municipality per month, attached to a month code key,
 *      i.e.: { jan: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...] }
 *    - months: {Object[]} default seasonalMonths with disabled month items, if any are applicable,
 *      i.e.: [{ id: "jan", label: "January", disabled: true },...]
 *    - error: {String} Crop calendar parsing errors
 */
export default function useCroppingCalendar (cropCalMunicipality, seasonalMonths, crop) {
  const [months, setSeasonalMonths] = useState([])
  const [subcropstages, setSubCropStages] = useState([])
  const [uniquecropstages, setUniqueCropStages] = useState({})
  const [error, setError] = useState('')

  const resetData = () => {
    setSeasonalMonths([])
    setSubCropStages([])
    setUniqueCropStages({})
  }

  useEffect(() => {
    setError('')

    if (cropCalMunicipality && seasonalMonths && crop) {
      const stageOptionsList = {}
      const tempmonth = [ ...seasonalMonths ]
      resetData()

      try {
        // Extract the formatted crop stage labels for each (6) seasonal months FIRST_HALF and SECOND_HALF
        const seasonalStages = seasonalMonths.reduce((list, month, idx) => {
          const monthcode = month.id
          const monthStages = cropCalMunicipality[monthcode]

          if (monthStages !== undefined && monthStages !== '') {
            const stages = monthStages.split(',')

            const tempStage = {
              id: idx,
              month: monthcode,
              [CROP_STAGES_MONTH.FIRST_HALF]: STAGE_NONE,
              [CROP_STAGES_MONTH.SECOND_HALF]: STAGE_NONE,
            }

            stageOptionsList[monthcode] = []

            stages.forEach((stage, index) => {
              const stageLabel = (stage === STAGE_NONE) ? STAGE_NONE : CROP_STAGE_LABELS[stage]

              if (!stageLabel) {
                throw new Error(`Invalid crop stage ${stage}`)
              }

              if (index === 0) {
                tempStage[CROP_STAGES_MONTH.FIRST_HALF] = stageLabel
              } else if (index === 1) {
                tempStage[CROP_STAGES_MONTH.SECOND_HALF] = stageLabel
              }

              // Format and keep unique crop stages per month
              if (stageOptionsList[monthcode].findIndex(options => options.label === stageLabel) === -1 && stageLabel !== STAGE_NONE) {
                stageOptionsList[monthcode].push({
                  id: stageOptionsList[monthcode].length,
                  label: stageLabel,
                  code: Object.keys(CROP_STAGE_LABELS).find(key => CROP_STAGE_LABELS[key] === stageLabel)
                })
              }
            })

            list.push(tempStage)
          }

          return list
        }, [])

        // Rebuild the selectable month list options, disabling months without crop stages
        // Add the seasonal weather forecast
        tempmonth.forEach((item) => {
          const monthcode = item.id
          item.disabled = (stageOptionsList[monthcode].length === 0)
        })

        // TO-DO: Crops should have recommendations

        setSubCropStages(seasonalStages)
        setSeasonalMonths(tempmonth)
        setUniqueCropStages(stageOptionsList)
      } catch (err) {
        setError(err.message)
        resetData()
      }
    }
  }, [cropCalMunicipality, seasonalMonths, crop])

  return { months, subcropstages, uniquecropstages, error }
}
