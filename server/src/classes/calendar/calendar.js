const { db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS } = require('../../utils/constants')
const { CROP_STAGE_LABELS, CROP_STAGES_MONTH, STAGE_NONE } = require('./constants')
const { getRangedMonths } = require('../../utils/date')

class CroppingCalendar {
  constructor () {
    this.local_stages = {
      'plant/trans': 'Newly Planted',
      'veg/repro': 'Vegetative/Reproductive',
      mat: 'Maturing',
      lprep: 'Preparation Stage',
      none: 'none'
    }
  }

  /**
   * Get the raw crop calendar object data for a province and municipality
   * @param {String} province - Province name (Firestore document)
   * @param {String} municipality - Municipality name
   * @returns {Object[]} Cropping calendar data for a municipality. May contain multiple documents for different crop(s)
   */
  async getcropcalendar ({ province, municipality }) {
    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.CROPPING_CALENDAR)
        .doc(province)
        .get()

      if (docRef.exists) {
        // Filter data by province and month(s)
        const docs = docRef.data().data
          .filter(doc =>
            doc.municipality === municipality)

        return docs || []
      } else {
        return []
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getcropcalendarall () {
    return await db.collection(FIRESTORE_COLLECTIONS.CROPPING_CALENDAR).get()
      .then((snapshot) => snapshot.docs.map((doc) =>
        doc.data()
      ))
  }

  /**
   * Get the raw crop calendar object data for a province, municipality and crop
   * @param {String} province - Province name (Firestore document)
   * @param {String} municipality - Municipality name
   * @param {String} crop - Crop name
   * @returns {Object} Cropping calendar data
   */
  async getcropcalrecord ({ province, municipality, crop }) {
    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.CROPPING_CALENDAR)
        .doc(province)
        .get()

      if (docRef.exists) {
        // Filter data by province and month(s)
        const doc = docRef.data().data
          .find(doc =>
            doc.municipality === municipality &&
            doc.crop === crop)

        return doc || null
      } else {
        return null
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extracts and sets a detailed list of crop stages for the given month
   * @param {Object} municipalcalendar - Raw cropping calendar data (row) of a municipality
   * @param {String} monthcode - Month code i.e., "jan", "feb",...
   * @returns {Object} { uniquecropstages, cropstagedetails }
   *    - uniquecropstages: {Object[]} unique crop stages list of a municipality for the given month,
   *      i.e.: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
   *    - cropstagedetails: {Object} detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month,
   *      i.e.: { month: 'jan', 1st_half: 'Maturing', 2nd_half: 'Maturing' }
   * @throws {Error} Data parsing and invalid crop stages conditions
   */
  usecropcalendarseasonal ({ municipalcalendar, monthcode }) {
    // Unique crop stages list of a municipality for the given month
    const uniquecropstages = []

    // Detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month
    const cropstagedetails = {
      month: monthcode,
      [CROP_STAGES_MONTH.FIRST_HALF]: STAGE_NONE,
      [CROP_STAGES_MONTH.SECOND_HALF]: STAGE_NONE
    }

    try {
      const monthStages = municipalcalendar[monthcode]

      if (!monthStages || monthStages === '') {
        throw new Error('No cropping calendar data for the selected month.')
      }

      const stages = monthStages.split(',')

      stages.forEach((stage, index) => {
        const stageLabel = (stage === STAGE_NONE) ? STAGE_NONE : CROP_STAGE_LABELS[stage]

        if (!stageLabel) {
          throw new Error(`Invalid crop stage ${stage}`)
        }

        if (index === 0) {
          cropstagedetails[CROP_STAGES_MONTH.FIRST_HALF] = stageLabel
        } else if (index === 1) {
          cropstagedetails[CROP_STAGES_MONTH.SECOND_HALF] = stageLabel
        }

        // Format and keep unique crop stages per month
        if (uniquecropstages.findIndex(options => options.label === stageLabel) === -1 && stageLabel !== STAGE_NONE) {
          uniquecropstages.push({
            id: uniquecropstages.length,
            label: stageLabel,
            code: Object.keys(CROP_STAGE_LABELS).find(key => CROP_STAGE_LABELS[key] === stageLabel)
          })
        }
      })

      // Check for valid crop stages - at least one month part should have a crop stage
      if (Object.values(cropstagedetails).filter(stage => stage === STAGE_NONE).length === 2) {
        throw new Error(`No available crop stages for ${monthcode}`)
      }

      return { uniquecropstages, cropstagedetails }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extracts and formats the following objects from a municipal cropping calendar data and the latest 10-DAY weather forecast:
   * List of raw crop stages, unique crop stages and "enabled" crops list for 1 or both (1st half, 2nd half) month "parts" of a start date, or a 10-day date range starting from the start date.
   * @param {Object[]} municipalcalendar - Raw cropping calendar data (rows) of a municipality for 1 or more crops
   * @param {Date} dateStart - Starting date JavaScript Date object to build detailed month reference on the cropping calendar
   * @param {Bool} isTendayRange - Flag to include the endDate of a 10-day date range, starting from "dateStart" when processing crop stages in inclusive month halves
   * @returns {Object} { uniquecropstages, stagespercrop, crops }
   *    - uniquecropstages: {Object[]} List of unique crop stages with crop stage codes arranged by order
   *    - stagespercrop: {Object} unique crop stages list of a municipality per month, attached to a crop key,
   *      i.e.: { Rice: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...] }
   *    - crops: {String[]} "Enabled" "crops" list with if each item has a crop stage on the given start date, or a 10-day date range starting from the start date.
   */
  usecropcalendartenday (municipalcalendar, dateStart, isTendayRange = false) {
    // Unique crop stages list of a municipality for the given month
    const uniquecropstages = []

    // Crop stages per crop and month part(s)
    const stagespercrop = {}

    // Unique crops list
    let crops = []

    // String date of dateStart
    let dateString

    // Check if an item exists in an Object[] array
    const itemExists = (objList, item) => (objList.findIndex(stage => stage.code === item) >= 0)

    if (municipalcalendar.length === 0) {
      throw new Error('Empty cropping calendar')
    }

    try {
      // Fine-tune stages detection - include date range of applicable months(s)
      // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
      // with 1st half or 2nd half month details of the inclusive month depending on the given "start date"
      const dateRangeStart = new Date(dateStart)
      dateString = dateRangeStart.toDateString()
      const months = getRangedMonths(dateRangeStart, isTendayRange)

      // Find the unique list of crops
      const cropslist = municipalcalendar.map(rec => rec.crop)
        .filter((x, i, a) => a.indexOf(x) === i)
        .map((crop, id) => ({ id, label: crop, disabled: false }))

      // Re-set unique crops list for [province-municipality] from the [Cropping Calendar]
      // Disable crops which has no available crop stages ("none") for the "current" part of selected month (1st half, 2nd half or both)
      try {
        cropslist.forEach((crop, index) => {
          if (stagespercrop[crop.label] === undefined) {
            stagespercrop[crop.label] = []
          }

          let nostagecount = 0
          let totalstages = 0

          Object.keys(months).forEach(monthcode => {
            // Get the crop calendar for the current crop
            // TO-DO: Add a validation check on the crop calendar uploader script - (1) crop should only have (1) crop calendar entry
            const cropCalendar = municipalcalendar.find(x => x.crop === crop.label)

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
                    id: stagespercrop[crop.label].length,
                    label: CROP_STAGE_LABELS[stages[0]],
                    code: stages[0],
                    municipality: cropCalendar.municipality
                  }

                  stagespercrop[crop.label].push(entry)

                  if (!itemExists(uniquecropstages, stages[0])) {
                    uniquecropstages.push(entry)
                  }
                } else {
                  nostagecount += 1
                }
              } else if (months[monthcode][i] === CROP_STAGES_MONTH.SECOND_HALF) {
                // crop.disabled = (stages[1] === STAGE_NONE)
                totalstages += 1

                if (stages[1] !== STAGE_NONE) {
                  const entry = {
                    id: stagespercrop[crop.label].length,
                    label: CROP_STAGE_LABELS[stages[1]],
                    code: stages[1],
                    municipality: cropCalendar.municipality
                  }

                  stagespercrop[crop.label].push(entry)

                  if (!itemExists(uniquecropstages, stages[1])) {
                    uniquecropstages.push(entry)
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

        // Exclude disabled crops from the cropslist
        crops = cropslist.filter(crop => (!crop.disabled)).map(crop => crop.label)
      } catch (err) {
        throw new Error(err.message)
      }
    } catch (err) {
      throw new Error(err.message)
    }

    if (uniquecropstages.length === 0) {
      throw new Error(`No crop stages are available for 10 days from ${dateString}.`)
    }

    if (Object.values(stagespercrop).length === 0) {
      throw new Error(`No crop stages grouped by crop are available for 10 days from ${dateString}.`)
    }

    if (crops.length === 0) {
      throw new Error(`No crops is not available for 10 days from ${dateString}.`)
    }

    return { uniquecropstages, stagespercrop, crops }
  }
}

module.exports = CroppingCalendar
