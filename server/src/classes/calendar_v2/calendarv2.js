const { db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS, MONTHS } = require('../../utils/constants')
const { CROP_STAGES_MONTH, STAGE_NONE } = require('../calendar/constants')
const { getRangedMonths } = require('../../utils/date')
const { getClimateRisk } = require('../../utils/climaterisk')

class CroppingCalendarV2 {
  /**
   * Retrieves the cropping calendar data of all provinces under a region for a specific crop
   * @param {String} crop Crop name
   * @returns {Object[]} List of Firestore documents containing cropping calendar data of a crop per province, including crop stages data
   */
  async getcropcalendarallV2 (crop = 'Rice') {
    const colPath = `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/calendar/${crop}`

    const docs = await db.collection(colPath).get()
      .then((snapshot) =>
        snapshot.docs.map((doc) =>
          doc.data()
        ))

    return docs
  }

  /**
   * Get the raw crop calendar object data for a province, municipality and crop
   * @typedef {Object} params - Input parameter
   * @param {String} params.province - Province name (Firestore document)
   * @param {String} params.municipality - Municipality name
   * @param {String} params.crop - Crop name
   * @returns {Object} New cropping calendar data Object { data1, data2, merged }
   *  - contains (2) sets of cropping calendar stages by month in the `data1` and `data2` keys.
   *  - `merged` contains the "merged" crop stages from `data1` and `data2`
   *  - `data1`, `data2` and `merged` are Object[] arrays
   */
  async getcropcalrecordV2 ({ province, municipality, crop }) {
    try {
      // 20240525: Use new cropping calendar Firestore path
      const cropCalendarPath = `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/${FIRESTORE_DOCUMENTS.CALENDAR_V2}/${crop}`

      const docRef = await db.collection(cropCalendarPath)
        .doc(province)
        .get()

      if (docRef.exists) {
        // Filter data by municipality
        const data1 = docRef.data().data?.data1
          .find(doc =>
            doc.municipality === municipality) ?? null

        const data2 = docRef.data().data?.data2
          .find(doc =>
            doc.municipality === municipality) ?? null

        // Merge data1 and data2 crop stages per month
        // TO-DO: Confirm if this logic is correct when filtering crop stages for generating recommendations
        const monthKeys = Object.keys(MONTHS)
        let merged = null

        if (data1 && data2) {
          merged = monthKeys.reduce((objectList, month) => {
            const mainStages = (data1[month] ?? '').split(',')
            const stages2 = (data2[month] ?? '').split(',')

            if (mainStages.length === 2 || stages2.length === 2) {
              for (let i = 0; i < mainStages.length; i += 1) {
                if (stages2[i] !== STAGE_NONE) {
                  if (mainStages[i] === STAGE_NONE) {
                    // Replace "none" stage with stage2
                    mainStages[i] = stages2[i]
                  } else {
                    // Append stage2 to the main stage
                    mainStages[i] += `,${stages2[i]}`
                  }
                }
              }
            }

            const m = {
              ...objectList,
              [month]: mainStages.join(',')
            }
            return m
          }, {})
        }

        return {
          data1,
          data2,
          merged
        }
      } else {
        return null
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Get all crop stages data from a cropping calendar
   * @param {String} crop - Crop name
   * @returns {Object} Object list of all crop stages for a target crop using stage codes as keys following the sample format:
   * ```
   * {
   *   mat: { code: 'mat', index: 6, label: 'Maturing' },
   *   plant: { code: 'plant', index: 2, label: 'Newly Planted' },
   *   prep: { code: 'prep', index: 0, label: 'Preparation Stage' },
   *   ...
   * }
   * ```
   */
  async getcropcalstagesdataV2 (crop) {
    const cropCalendarPath = `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/${FIRESTORE_DOCUMENTS.CALENDAR_V2}/${crop}`

    const docRef = await db.collection(cropCalendarPath)
      .doc(FIRESTORE_DOCUMENTS.CALENDAR_V2_STAGES)
      .get()

    if (docRef.exists) {
      return docRef.data()?.data
    } else {
      return null
    }
  }

  async getcropcalstagesseasonal (crop) {
    const cropCalendarPath = `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_SEASONAL_X}/${FIRESTORE_DOCUMENTS.CALENDAR_V2}/${crop}`

    const docRef = await db.collection(cropCalendarPath)
      .doc(FIRESTORE_DOCUMENTS.CALENDAR_V2_STAGES)
      .get()

    if (docRef.exists) {
      return docRef.data()?.data
    } else {
      return null
    }
  }

  /**
   * Retrieves all available crops with attached crop recommendations for a region
   * @returns {String[]} List of all crops with available crop recommendations under a region
   */
  async getcropcalcropslistV2 () {
    const subCollections = await db.collection(FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X)
      .doc(FIRESTORE_DOCUMENTS.CALENDAR_V2)
      .listCollections()

    return (subCollections ?? []).map(item => item.id)
  }

  /**
   * Fetches the full cropping calendar data with optional climate risk information given the input parameters
   * @typedef {Object} params - Input parameters
   * @param {String} params.province - Province name
   * @param {String} params.municipality - Municipality name
   * @param {String} params.crop - Crop name
   * @param {String} params.weatherType - (Optional) Weather forecast type. One of `"seasonal"` or `"tenday"`. Required with `params.weatherData`
   * @param {String} params.weatherData - (Optional) Minimal 10-day or seasonal weather forcast data. Required with `params.weatherType`
   *    - See `getClimateRisk()` - `TendayForecastItem[]` if `weatherType=tenday`
   *    - i.e., `[{ day, day_format, day_str, rainfall },...]`
   *    - See `getClimateRisk()` - `SeasonalForecastItem[]` if `weatherType=seasonal`
   *    - i.e., `[{ condition, mo, year },...]`
   * @returns {Array[]} - An array of cropping calendar related data sets
   *    ```
   *    [
   *       calendarData {Object} // raw cropping calendar data { data1, data2, merged },
   *       stagesData {Object} // Crop stages masterlist data for the given crop,
   *       cropsListData {String[]} // List of all crops with cropping calendar data,
   *       climateRisk {String} // Climate risk label for the given 10-day or seasonal weather forecast data. Skips returning this output if `params.weatherType` and `params.weatherData` is not defined.
   *    ]
   *    ```
   */
  async getcropcalendardatasetV2 ({ province, municipality, crop, weatherType, weatherData }) {
    try {
      if ((weatherType && !weatherData) || (weatherData && !weatherType)) {
        throw new Error('Incomplete or missing weather data parameter/s')
      }

      if (weatherData && !Object.keys(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2)
        .map(key => key.toLowerCase())
        .includes(weatherType)
      ) {
        throw new Error(`Invalid weather forecast type: ${weatherType}`)
      }

      const promises = [
        this.getcropcalrecordV2({ province, municipality, crop }),
        this.getcropcalstagesdataV2(crop),
        this.getcropcalcropslistV2()
      ]

      // Optional climate risk fetch
      if (weatherType && weatherData) {
        promises.push(getClimateRisk(weatherType, weatherData))
      }

      return await Promise.all(promises)
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Checks if a set of crop stages for a month is valid
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
  isValidCropStageSet = (stagesCodeSet, allStages) => {
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
   * Extracts, sets and validates a detailed list of crop stages for the given month
   * @typedef {Object} params - Input data
   * @param {Object} params.municipalcalendar - Raw cropping calendar data (row) of a municipality from the main and 2nd set of crop stages
   *    - follows the format i.e., { data1, data2 }
   * @param {String} params.monthcode - Month code i.e., "jan", "feb",...
   * @param {Bool} params.allowNoData - Flag to allow months with consolidated "none" crop stages for the 1st and 2nd month halves from the data1 and data2 stages data sets.
   *    - Returns an empty response or response with all-"none"data and does not throw an Error.
   * @param {Object} params.allStages - Object masterlist of all cropping calendar stages for a specific crop
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
   * @returns {Object} Unique crop stage data for the given month: `{ uniquecropstages, cropstagedetails }`
   *    - `uniquecropstages`: {Object[]} unique crop stages list of a municipality for the given month,
   *      i.e.: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
   *    - `cropstagedetails`: {Object} detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month,
   *      i.e.: { month: 'jan', 1st_half: ['Maturing', 'Newly Planted'], 2nd_half: ['Maturing', Preparation Stage] }
   * @throws {Error} Data parsing and invalid crop stages conditions
   */
  usecropcalendarseasonalV2 ({ municipalcalendar, monthcode, allStages, allowNoData = false }) {
    // Unique crop stages list of a municipality for the given month
    const uniquecropstages = []

    // Detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month
    const cropstagedetails = {
      month: monthcode,
      [CROP_STAGES_MONTH.FIRST_HALF]: [],
      [CROP_STAGES_MONTH.SECOND_HALF]: []
    }

    try {
      const monthStages1 = municipalcalendar.data1[monthcode]
      const monthStages2 = municipalcalendar.data2[monthcode]
      const monthStagesString = `${monthStages1 ?? ''}${monthStages2 ?? ''}`

      if (monthStagesString === '') {
        throw new Error('No cropping calendar data for the selected month.')
      }

      const stages1 = monthStages1.split(',')
      const stages2 = monthStages2.split(',')
      const MAX_CROP_STAGES = 2

      // Validate each crop stage data set
      if (
        !this.isValidCropStageSet(stages1, allStages) ||
        !this.isValidCropStageSet(stages2, allStages)
      ) {
        throw new Error(`Invalid set of crop stages for month: ${monthcode}`)
      }

      for (let i = 0; i < MAX_CROP_STAGES; i += 1) {
        const stageCode1 = stages1[i]
        const stageCode2 = stages2[i]
        const mergedStageCodes = [stageCode1, stageCode2]

        if (i === 0) {
          cropstagedetails[CROP_STAGES_MONTH.FIRST_HALF] = [...mergedStageCodes]
        } else if (i === 1) {
          cropstagedetails[CROP_STAGES_MONTH.SECOND_HALF] = [...mergedStageCodes]
        }

        // Format and keep unique no "none" crop stages per month
        mergedStageCodes.forEach((stage) => {
          if (uniquecropstages.findIndex(options => options.code === stage) === -1 && stage !== STAGE_NONE) {
            uniquecropstages.push({
              id: uniquecropstages.length,
              label: allStages[stage].label,
              code: stage
            })
          }
        })
      }

      // Check for valid crop stages - at least one (1) "merged" month half should have a no "none" crop stage
      const firstHalfNone = cropstagedetails[CROP_STAGES_MONTH.FIRST_HALF]
        .filter(stage => stage === STAGE_NONE).length

      const secondHalfNone = cropstagedetails[CROP_STAGES_MONTH.SECOND_HALF]
        .filter(stage => stage === STAGE_NONE).length

      if (
        firstHalfNone === 2 &&
        secondHalfNone === 2 &&
        !allowNoData
      ) {
        throw new Error(`No available crop stages for ${monthcode}`)
      }

      return { uniquecropstages, cropstagedetails }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extracts, sets and validates a detailed list of crop stages for the given set of month(s)
   * @typedef {Object} params - Input data
   * @param {Object} params.municipalcalendar - Raw cropping calendar data (row) of a municipality from the main and 2nd set of crop stages
   *    - follows the format i.e., { data1, data2 }
   * @param {String[]} params.monthcodes - List of month code in a String array i.e., `["jan", "feb",..., "june"]`
   * @param {Object} params.allStages - Object masterlist of all cropping calendar stages for a specific crop
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
   * @returns {Object} Unique crop stage data for the given set of months: `{ uniquecropstages, cropstagedetails }`
   *    - `uniquecropstages`: {Object[]} unique crop stages list of a municipality for the given month,
   *      i.e.: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
   *    - `cropstagedetails`: {Object} detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month,
   *      i.e.: { month: 'jan', 1st_half: ['Maturing', 'Newly Planted'], 2nd_half: ['Maturing', Preparation Stage] }
   * @throws {Error} Data parsing and invalid crop stages conditions
   */
  usecropcalendarseasonalFull ({ municipalcalendar, monthcodes = [], allStages }) {
    try {
      // Returns and "ordered" and "unique" set of crop stages ordered by given monthcodes
      return monthcodes.reduce((objList, month) => {
        const calendarMonthData = this.usecropcalendarseasonalV2({
          municipalcalendar,
          monthcode: month,
          allStages,
          allowNoData: true
        })

        calendarMonthData.uniquecropstages.forEach((stage) => {
          if (!objList.uniquecropstages.find(item => item.code === stage.code)) {
            objList.uniquecropstages.push({
              id: objList.uniquecropstages.length,
              label: stage.label,
              code: stage.code
            })
          }
        })

        objList.cropstagedetails[month] = { ...calendarMonthData.cropstagedetails }
        return objList
      }, { uniquecropstages: [], cropstagedetails: {} })
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extracts and formats the following objects from a municipal cropping calendar data and the latest 10-DAY weather forecast:
   * List of raw crop stages, unique/ordered crop stages and "enabled" crops list for 1 or both (1st half, 2nd half) month "parts" of a start date, or a 10-day date range starting from the start date.
   * @typedef {Object} params - Input object
   * @param {Object[]} params.municipalcalendar - Raw cropping calendar data (rows) of a municipality for only one (1) type of crop
   * @param {Date} params.dateStart - Starting date JavaScript Date object to build detailed month reference on the cropping calendar
   * @param {Bool} params.isTendayRange - Flag to include the endDate of a 10-day date range, starting from "dateStart" when processing crop stages in inclusive month halves
   * @param {Object} params.allStages - Unordered Object masterlist of all cropping calendar stages for a specific crop
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
   * @param {String[]} params.cropslistData - String array list of all crop names for a region
   * @returns {Object} { uniquecropstages, stagespercrop, crops }
   *    - uniquecropstages: {Object[]} List of unique crop stages with crop stage codes arranged by order
   *    - stagespercrop: {Object} unique crop stages list of a municipality per month, attached to a crop key,
   *      i.e.: { Rice: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...] }
   *    - crops: {String[]} "Enabled" "crops" list with if each item has a crop stage on the given start date, or a 10-day date range starting from the start date.
   */
  usecropcalendartendayV2 ({ municipalcalendar, dateStart, isTendayRange = false, allStages = null, cropslistData = [] }) {
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

    if (cropslistData.length === 0) {
      throw new Error('Emply crops list')
    }

    try {
      // Fine-tune stages detection - include date range of applicable months(s)
      // Find the months (max 2) inside the 10-Day range where the current 10-day weather data belongs to
      // with 1st half or 2nd half month details of the inclusive month depending on the given "start date"
      const dateRangeStart = new Date(dateStart)
      dateString = dateRangeStart.toDateString()
      const months = getRangedMonths(dateRangeStart, isTendayRange)

      // Get the crop calendar for the current crop
      // TO-DO: Add a validation check on the crop calendar uploader script - (1) crop should only have (1) crop calendar entry
      const cropCalendar = municipalcalendar.data1
      const cropCalendar2 = municipalcalendar.data2

      if (!cropCalendar || !cropCalendar2) {
        throw new Error('Cannot find cropping calendar')
      }

      // Build crops list from given input array
      // TO-DO: Do not accecpt a list of crops. Use only one (1) crop
      const cropslist = cropslistData.map((crop, id) => ({ id, label: crop, disabled: false }))

      // Re-set unique crops list for [province-municipality] from the [Cropping Calendar]
      // Disable crops which has no available crop stages ("none") for the "current" part of selected month (1st half, 2nd half or both)
      try {
        cropslist.forEach((crop, index) => {
          if (stagespercrop[crop.label] === undefined) {
            stagespercrop[crop.label] = []
          }

          let nostagecount = 0
          let totalstages = 0

          // Generates a valid (no "none" stage) `uniquecropstages` and `stagespercrop` object
          const generateValidEntry = (stageCode, municipality) => {
            if (stageCode === STAGE_NONE) return

            const entry = {
              id: stagespercrop[crop.label].length,
              label: allStages[stageCode].label,
              code: stageCode,
              municipality
            }

            stagespercrop[crop.label].push(entry)

            if (!itemExists(uniquecropstages, stageCode)) {
              uniquecropstages.push(entry)
            }
          }

          Object.keys(months).forEach(monthcode => {
            // Get the month's crop calendar data for the current crop
            const monthStages = cropCalendar[monthcode]
            const monthStages2 = cropCalendar2[monthcode]
            const monthStagesString = `${monthStages ?? ''}${monthStages2 ?? ''}`

            if (monthStagesString === '') {
              throw new Error(`Crop stages data for ${monthcode} does not exist.`)
            }

            // Stages per month always contain (2) stages, separated by comma
            const stages1 = monthStages.split(',')
            const stages2 = monthStages2.split(',')

            // Each crop stage data set should have two (2) stages
            if (
              !this.isValidCropStageSet(stages1, allStages) ||
              !this.isValidCropStageSet(stages2, allStages)
            ) {
              throw new Error(`Invalid set of crop stages for month: ${monthcode}`)
            }

            // Look-up each month part detail (1st half, 2nd half or both) for STAGE_NONE
            // Set crop to disabled if one or both month part detail is STAGE_NONE
            for (let i = 0; i < months[monthcode].length; i += 1) {
              if (months[monthcode][i] === CROP_STAGES_MONTH.FIRST_HALF) {
                const FIRST_HALF_INDEX = 0
                totalstages += 1

                generateValidEntry(stages1[FIRST_HALF_INDEX], cropCalendar.municipality)
                generateValidEntry(stages2[FIRST_HALF_INDEX], cropCalendar.municipality)

                if (stages1[FIRST_HALF_INDEX] === STAGE_NONE && stages2[FIRST_HALF_INDEX] === STAGE_NONE) {
                  nostagecount += 1
                }
              } else if (months[monthcode][i] === CROP_STAGES_MONTH.SECOND_HALF) {
                const SEC_HALF_INDEX = 1
                totalstages += 1

                generateValidEntry(stages1[SEC_HALF_INDEX], cropCalendar.municipality)
                generateValidEntry(stages2[SEC_HALF_INDEX], cropCalendar.municipality)

                if (stages1[SEC_HALF_INDEX] === STAGE_NONE && stages2[SEC_HALF_INDEX] === STAGE_NONE) {
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

module.exports = CroppingCalendarV2
