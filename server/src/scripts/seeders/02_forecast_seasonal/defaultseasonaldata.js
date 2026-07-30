const { MONTHS } = require('../../../utils/constants')

/**
 * Generates a Number list Array[] of "maxMonths" starting from a "startMonth"
 * @param {Number} startMonth - Month ordinal number in number (0 - 11) format.
 * @param {Number} maxMonths - Maximum number of numeric months to generate. Max is 12 (12 months = 1 year)
 */
const generateMonthsArray = (startMonth = 0, maxMonths = 6) => {
  const maxMonthIndex = 11 // December

  if (startMonth > maxMonthIndex) {
    throw new Error(`Start month ${startMonth} greater than ${maxMonthIndex}`)
  }

  if (maxMonths > (maxMonthIndex + 1)) {
    throw new Error(`Max months ${maxMonths} greater than ${maxMonthIndex + 1}`)
  }

  return new Array(maxMonths).fill(-1)
    .reduce((list, item, index) => {
      if (index === 0) {
        return [...list, startMonth]
      } else {
        const lastItem = list[index - 1]
        const monthIndex = (lastItem >= 11)
          ? 0
          : (lastItem + 1)
        return [...list, monthIndex]
      }
    }, [])
}

/**
 * Generate default seasonal data for a month, starting with the system's current month as default.
 * @returns {Object[]} Each item in the array is a seasonal data for a certain month.
 *    - mo: {String} Month code
 *    - val: {Number} %N forecast rainfall value (table with colorful cells)
 *    - con: {Number} Weather condition
 *    - dry: {Number} Dry/wet days forecast
 *    - mean: {Number} Mean of mean/max rainfall
 *    - normal: {Number} Normal rainfall value 1991-2020
 *    - year: {Number} Current year associated with the month
 */
const createDefaultSixMonthsData = () => {
  const maxMonths = 6
  const dateNow = new Date()
  const currentMonth = dateNow.getMonth()
  const currentYear = dateNow.getFullYear()
  const monthCodes = Object.keys(MONTHS)
  const monthsData = []

  try {
    const monthIndices = generateMonthsArray(currentMonth, maxMonths)
    let year = currentYear

    for (let i = 0; i < maxMonths; i += 1) {
      if (monthIndices[i] === 0 && i > 0) {
        year += 1
      }

      monthsData.push({
        mo: monthCodes[monthIndices[i]],
        val: 0,
        con: 'wb_normal',
        dry: 0,
        mean: 0,
        normal: 0,
        year
      })
    }

    // Log months and years
    console.log(monthsData.map((item) => ({ mo: item.mo, year: item.year })))

    return monthsData
  } catch (err) {
    throw new Error(err.message)
  }
}

/**
 * Generate a default sample seasonal weather forecast data following the format in the "/src/scripts/data/weather_seasonal.json" file for the given region and province list parameters.
 * @param {String} region - Region name.
 * @param {String[]} provinceList - An array of province names belonging to a region.
 * @returns {Object} { region, provinces }
 *    - region {String} - region name
 *    - provinces {Object[]} - Each item in the array is a seasonal data for a certain month.
 *    - provinces.mo: {String} Month code
 *    - provinces.val: {Number} %N forecast rainfall value (table with colorful cells)
 *    - provinces.con: {Number} Weather condition
 *    - provinces.dry: {Number} Dry/wet days forecast
 *    - provinces.mean: {Number} Mean of mean/max rainfall
 *    - provinces.normal: {Number} Normal rainfall value 1991-2020
 *    - provinces.year: {Number} Current year associated with the month
 */
const generateDefaultSeasonalData = (region, provinceList = []) => {
  try {
    const monthsData = createDefaultSixMonthsData()

    return {
      region,
      provinces: provinceList.reduce((list, province) => {
        list.push({
          name: province,
          months: monthsData
        })

        return list
      }, [])
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = {
  generateDefaultSeasonalData,
  createDefaultSixMonthsData,
  generateMonthsArray
}
