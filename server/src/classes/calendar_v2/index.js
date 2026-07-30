const CroppingCalendarV2 = require('./calendarv2')
const CAL2 = new CroppingCalendarV2()

/**
  * Retrieves the cropping calendar data of all provinces under a region for a specific crop
  * @param {String} crop Crop name
  * @returns {Object[]} List of Firestore documents containing cropping calendar data of a crop per province, including crop stages data
  */
const getcropcalendarallV2 = CAL2.getcropcalendarallV2.bind(CAL2)

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
const getcropcalrecordV2 = CAL2.getcropcalrecordV2.bind(CAL2)

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
const getcropcalstagesdataV2 = CAL2.getcropcalstagesdataV2.bind(CAL2)

/**
  * Get all crop stages data from a cropping calendar seasonal
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
const getcropcalstagesseasonal = CAL2.getcropcalstagesseasonal.bind(CAL2)

/**
  * Retrieves all available crops with attached crop recommendations for a region
  * @returns {String[]} List of all crops with available crop recommendations under a region
  */
const getcropcalcropslistV2 = CAL2.getcropcalcropslistV2.bind(CAL2)

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
const getcropcalendardatasetV2 = CAL2.getcropcalendardatasetV2.bind(CAL2)

/**
  * Extracts, sets and validates a detailed list of crop stages for the given month
  * @typedef {Object} params - Input data
  * @param {Object} params.municipalcalendar - Raw cropping calendar data (row) of a municipality from the main and 2nd set of crop stages
  *    - follows the format i.e., { data1, data2 }
  * @param {String} params.monthcode - Month code i.e., "jan", "feb",...
  * @param {Bool} params.allowNoData - Flag to allow months with consolidated "none" crop stages for the 1st and 2nd month halves from the data1 and data2 stages data sets.
  *    - Returns an empty response or response with all-"none"data and does not throw an Error.
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
  * @returns {Object} Unique crop stage data for the given month: `{ uniquecropstages, cropstagedetails }`
  *    - `uniquecropstages`: {Object[]} unique crop stages list of a municipality for the given month,
  *      i.e.: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...]
  *    - `cropstagedetails`: {Object} detailed crop stages of a municipality containing crop stage data for FIRST_HALF and SECOND_HALF of a month,
  *      i.e.: { month: 'jan', 1st_half: ['Maturing', 'Newly Planted'], 2nd_half: ['Maturing', Preparation Stage] }
  * @throws {Error} Data parsing and invalid crop stages conditions
  */
const usecropcalendarseasonalV2 = CAL2.usecropcalendarseasonalV2.bind(CAL2)

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
const usecropcalendarseasonalFull = CAL2.usecropcalendarseasonalFull.bind(CAL2)

/**
  * Extracts and formats the following objects from a municipal cropping calendar data and the latest 10-DAY weather forecast:
  * List of raw crop stages, unique crop stages and "enabled" crops list for 1 or both (1st half, 2nd half) month "parts" of a start date, or a 10-day date range starting from the start date.
  * @typedef {Object} params - Input object
  * @param {Object[]} params.municipalcalendar - Raw cropping calendar data (rows) of a municipality for only one (1) type of crop
  * @param {Date} params.dateStart - Starting date JavaScript Date object to build detailed month reference on the cropping calendar
  * @param {Bool} params.isTendayRange - Flag to include the endDate of a 10-day date range, starting from "dateStart" when processing crop stages in inclusive month halves
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
  * @param {String[]} params.cropslistData - String array list of all crop names for a region
  * @returns {Object} { uniquecropstages, stagespercrop, crops }
  *    - uniquecropstages: {Object[]} List of unique crop stages with crop stage codes arranged by order
  *    - stagespercrop: {Object} unique crop stages list of a municipality per month, attached to a crop key,
  *      i.e.: { Rice: [{ id: 0, label: 'Preparation Stage', code: 'lprep' },...] }
  *    - crops: {String[]} "Enabled" "crops" list with if each item has a crop stage on the given start date, or a 10-day date range starting from the start date.
  */
const usecropcalendartendayV2 = CAL2.usecropcalendartendayV2.bind(CAL2)

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
const isValidCropStageSet = CAL2.isValidCropStageSet.bind(CAL2)

module.exports = {
  CAL2,
  getcropcalendarallV2,
  getcropcalrecordV2,
  getcropcalstagesdataV2,
  getcropcalstagesseasonal,
  getcropcalcropslistV2,
  getcropcalendardatasetV2,
  usecropcalendarseasonalV2,
  usecropcalendartendayV2,
  usecropcalendarseasonalFull,
  isValidCropStageSet
}
