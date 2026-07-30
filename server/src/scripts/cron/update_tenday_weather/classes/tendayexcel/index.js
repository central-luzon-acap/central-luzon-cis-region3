const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const { PROVINCES } = require('../../lib/constants')
const { isDateValid } = require('../../../../../utils/date')

class TenDayExcel {
  /**
   * Set the target region, provinces and municipalities
   * @param {String} regionName - region name
   * @param {String[]} provinces - (Optional) provinces under the the specified region
   *    No need to include this parameter if the target region's provinces
   *    is already defined in the PROVINCES constant
   * @param {String[]} municipalities - (Optional) a list of mixed municipalities under provinces
   *    Only the municipalities listed here will be processed and written to CSV
   */
  constructor ({ regionName, provinces, municipalities = [] }) {
    if (regionName === undefined) {
      throw new Error('Missing parameter/s.')
    }

    if (provinces === undefined && PROVINCES[regionName] === undefined) {
      throw new Error('Must define province list.')
    }

    // Region name
    this.region = regionName

    // Provinces list
    this.provinces = (provinces !== undefined)
      ? provinces
      : PROVINCES[regionName]

    // Municipalities list (mixed across provinces)
    this.municipalities = municipalities

    // Target column keys as defined in the converted "sheetjs" JSON excel spreadsheet and their local names
    this.columns = {
      __EMPTY: 'location',
      __EMPTY_1: 'tmin',
      __EMPTY_2: 'tmax',
      __EMPTY_3: 'tmean',
      __EMPTY_5: 'rainfall',
      __EMPTY_6: 'cover',
      __EMPTY_7: 'humidity',
      __EMPTY_8: 'wspeed',
      __EMPTY_9: 'wind direction',
      'CLIMPS-FF-1': 'wind direction'
    }

    this.columnChecks = {
      __EMPTY: { type: String, maxLength: 50 }, // province
      municipality: { type: String, maxLength: 50 }, // municipality
      __EMPTY_1: { type: Number, maxLength: 30 }, // tmin
      __EMPTY_2: { type: Number, maxLength: 30 }, // tmax
      __EMPTY_3: { type: Number, maxLength: 30 }, // tmean
      __EMPTY_5: {
        type: String,
        maxLength: 15, // rainfall
        values: ['NO RAIN', 'LIGHT RAINS', 'MODERATE RAINS', 'HEAVY RAINS']
      },
      __EMPTY_6: {
        type: String,
        maxLength: 15, // cloud cover
        values: ['SUNNY', 'MOSTLY SUNNY', 'PARTLY CLOUDY', 'MOSTLY CLOUDY', 'CLOUDY']
      },
      __EMPTY_7: { type: Number, maxLength: 30 }, // humidity
      __EMPTY_8: { type: Number, maxLength: 30 }, // wind speed
      __EMPTY_9: {
        type: String,
        maxLength: 6, // wind direction. __EMPTY_9 can also be CLIMPS-FF-1
        values: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      },
      'CLIMPS-FF-1': {
        type: String,
        maxLength: 6, // wind direction. __EMPTY_9 can also be CLIMPS-FF-1
        values: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      }
    }
  }

  /**
   * Check which of '__EMPTY_9', 'CLIMPS-FF-1' excel column is available for wind speed
   * @param {String} key - Excel column name for wind speed (__EMPTY_9 or CLIMPS-FF-1)
   * @param {Object} row - Excel row converted to Object
   * @returns {String} __EMPTY_9 or CLIMPS-FF-1
   * @throws {Error} Throws an error if either row.__EMPTY_9 or row['CLIMPS-FF-1] is undefined
   */
  getHeaderForWindspeed (key, row) {
    let wspeedKey = key

    // Check which of '__EMPTY_9', 'CLIMPS-FF-1' is available for wind speed
    if (key === '__EMPTY_9') {
      if (row[key] === undefined && row['CLIMPS-FF-1'] === undefined) {
        throw new Error('Cannot find wind direction on __EMPTY_9')
      }

      wspeedKey = row[key] ? key : 'CLIMPS-FF-1'
    }

    if (key === 'CLIMPS-FF-1') {
      if (row[key] === undefined && row.__EMPTY_9 === undefined) {
        throw new Error('Cannot find wind direction on CLIMPS-FF-1')
      }

      wspeedKey = row[key] ? key : '__EMPTY_9'
    }

    return wspeedKey
  }

  /**
   * All columns (keys) exists in a row
   * @param {Object} row - Excel row converted to Object
   * @returns {Boolean} true - all defined columns exist in a row
   * @throws {Error} - Missing Excel key and local key value
   */
  allColumnsExist (row) {
    for (const key in this.columns) {
      const field = (['CLIMPS-FF-1', '__EMPTY_9'].includes(key))
        ? this.getHeaderForWindspeed(key, row)
        : key

      if (row[field] === undefined) {
        throw new Error(`Missing column ${key} - ${this.columns[key]}`)
      }
    }

    return true
  }

  /**
   * Extract the years (4-digit char sequences) in a string
   * @param {String} dateStr - Any string containing 4-digit Number char sequences
   * @returns {String[]} List of all 4-digit Number char sequences
   */
  getYearInString (dateStr) {
    return dateStr.match(/[\d]{4}|[,]{4}/g)
  }

  /**
   * Get the maximum no. of days in a month
   * @param {String} year - Year
   * @param {Number} month JavaScript Month (0-11)
   * @returns {Number} Maximum days in a month
   */
  getMaxDaysInMonth (year, month) {
    return new Date(year, month + 1, 0).getDate()
  }

  /**
   * Get the forecast date
   * @param {String} string - String from a row on where to extract the forecast date
   * @returns {String} Forecast date
   * @throws {Error} - Missing FORECAST DATE
   */
  getForecastDate (string) {
    if (!string.toString().includes('FORECAST DATE')) {
      throw new Error('Missing FORECAST DATE keyword')
    }

    return string.substr(string.indexOf(':') + 2, string.length)
  }

  /**
   * Get the day weather forecast's date range validity period from a string
   * Patterns include:
   * If the 10 days range fall within a month:
   *    - format (a): "June 01-10, 2022"
   *    - format (b): "June 06 - June 15,2022"
   * If the 10 days range span across (2) months:
   *    - format (c): "May 30 - June 8, 2022"
   *    - format (d): "May 30, 2022 - June 8, 2022"
   * @param {String} string - String on where to extract the date range
   * @returns {String} Date range validity period
   * @throws {Error} Date range validation errors
   */
  getDateRange (string) {
    if (typeof string !== 'string') {
      throw new Error('Date range parameter must be a string')
    }

    const rtemp = string.replace('–', '-')

    try {
      // Date range string should contain a "Valid" word
      // Start and end dates are separated by a "–" character
      if (!rtemp.includes('Valid') || !rtemp.includes('-')) {
        throw new Error(`Missing expected date range keywords: "${string}"`)
      }

      // Date range should at least have an end date year
      const years = this.getYearInString(rtemp)

      if (!years) {
        throw new Error('Date range has no year/s')
      }

      // Check if start and end dates are valid
      const dates = rtemp.replace('Valid :', '').trim().split('-')
        .map(item => item.trim())

      // Require year in the end date
      if (!this.getYearInString(dates[1])) {
        throw new Error('End date has no year')
      }

      // Check if the start and end years differ too much
      if (years.length === 2) {
        if (Math.abs(years[1] - years[0]) > 1) {
          throw new Error('Start and end date year exceeds one (1) year.')
        }
      }

      // Check START date for valid month and day
      if (!isDateValid(dates[0])) {
        throw new Error(`Invalid date detected in the 10-day date range's START date: ${string}`)
      }

      // Apply the start date's month to the end date, if raw format
      // does not include a month, like "June 01-10, 2022"
      if (!/[a-zA-Z]/g.test(dates[1])) {
        dates[1] = `${new Date(dates[0]).getMonth() + 1} ${dates[1]}`
      }

      // Check END date for valid month and day
      if (!isDateValid(dates[1])) {
        throw new Error(`Invalid date detected in the 10-day date range's END: ${string}`)
      }

      // Validate the END year if strict date range validity year checking is turned on.
      // End year should be the current year, or the next year based on the START and END date months.
      if (process.env.CHECK_RANGE_YEAR === '1') {
        // Check END year if its month is January and the START month is less than January
        const timeZone = 'Singapore'
        const endDate = new Date(dates[1]).toLocaleDateString('en', { timeZone }).split('/')
        const endMonth = parseInt(endDate[0])
        const endYear = parseInt(endDate[2])

        // WARNING: The START date may or may not have a valid year (i.e., if dates[0]) = "Dec 29")
        const startDatePartial = new Date(dates[0]).toLocaleDateString('en', { timeZone }).split('/')
        const startMonth = parseInt(startDatePartial[0])

        // Use the current year for the START date
        const currentYear = parseInt(new Date().toLocaleDateString('en', { timeZone }).split('/')[2])

        if (
          // END month is January and the START month is December
          (endMonth === 1 && startMonth === 12) &&
          // END year is less than or equal to the CURRENT (START month) year
          (endYear <= currentYear)
        ) {
          throw new Error(`Invalid END year detected in the 10-day date range: ${rtemp.replace('Valid :', '')}.\nCurrent year is ${currentYear}.`)
        }

        if (
          // END month and START month are the same
          (endMonth === startMonth) &&
          // END year is not equal to the CURRENT year
          (endYear !== currentYear)
        ) {
          throw new Error(`Invalid END year detected in the 10-day date range: ${rtemp.replace('Valid :', '')}`)
        }
      }

      // Start date should have a year if end date falls between January 1 - 9
      // TO-DO: Test Jan 1 - 9 dates
      if (dayjs(dates[1]).isBetween(
        new Date(`January 1, ${years[years.length - 1]}`).toString(),
        new Date(`January 9, ${years[years.length - 1]}`).toString(), 'day', '[]')) {
        if (!this.getYearInString(dates[0])) {
          // Start date (Dec) does not have a year
          // Automatically deduct 1 year from the end date's year and assign it to the start date's year
          const endYear = new Date(dates[1]).getFullYear()
          dates[0] = new Date(`${dates[0]}, ${endYear - 1}`).toDateString()
          years.push(endYear - 1)
          years.reverse()

          // throw new Error('Cannot determine the start date\'s year')
        }
      }

      // Start date should be less than the end date
      const startDateFull = (years.length === 2)
        ? dates[0]
        : `${dates[0]}, ${years[0]}`

      if (dayjs(startDateFull).isAfter(new Date(dates[1]).toDateString())) {
        throw new Error('Start date is ahead of the end date.')
      }

      // Date range should span across 10 days only
      const day1 = dayjs(startDateFull)
      const day2 = dayjs(dates[1])
      const diff = day2.diff(day1.toString(), 'day')

      if (diff !== 9) {
        throw new Error(`There should be ten (10) days in the 10-day date range. Upload detected (${diff}) days in the date range.`)
      }

      // TO-DO: Include pattern parsing
      return rtemp.replace('Valid :', '').trim()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Get the start date in a string date range
   * @param {String} dateRangeStr - Date range string, separated by a hyphen "-" char
   *    Should follow the format:
   *      - "July 08-17, 2022"
   *      - "July 29-Aug 07,2022"
   *      - "December 28, 2022 - January 6, 2024"
   *    Should consider the format (contains Dec and Jan):
   *      - "Dec 28 - Jan 06, 2023"
   * @returns {Date} Start Date of the date range string
   */
  getForecastStartDate (dateRangeStr) {
    const years = this.getYearInString(dateRangeStr)
    const dates = dateRangeStr.split('-')
    let decemberStartDate

    if (dates.length === 2) {
      let tempStartDate = new Date(`${dates[0]}, ${new Date().getFullYear()}`)
      const endDate = new Date(dates[1])

      // Start date falls on December and end date falls in January
      if (tempStartDate.getMonth() + 1 === 12 && endDate.getMonth() + 1 === 1) {
        // Current date's getFullYear() reference falls on January, but start date is in Dec. 28 +
        if (new Date().getFullYear() === parseInt(years[0])) {
          tempStartDate = new Date(`${dates[0]}, ${parseInt(years[0]) - 1}`)
        }

        decemberStartDate = tempStartDate
      }
    }

    return (years === null || dates.length !== 2)
      ? new Date() // Default Date now
      : decemberStartDate ?? new Date(`${dates[0].trim()}, ${years[0]}`)
  }

  /**
   * Extract the  'YYYY/MM/DD' Date string in a string like '06/14/2023 @8AM' of PAGASA's FORECAST DATE line
   * @param {String} dateOfForecastString
   * @returns 'YYYY/MM/DD' Date string
   */
  getYYYYMMDDfromDateForecast (dateOfForecastString) {
    return dateOfForecastString.substring(0, 10)
  }

  /**
   * Get the province where a municipality belongs to
   * @param {String} municipality - Municipality name following the pattern
   *    "municipalityName (provinceName)"
   * @returns {String} Province name
   * @returns {undefined} Returns undefined if the municipality is not associated
   *    with any of the defined provinces
   */
  getProvince (municipality) {
    return this.provinces.find(
      // Fix: include the parenthesis when looking for the province
      province => municipality.toString().includes(`(${province})`)
    )
  }

  /**
   * Extract the municipality name from a string following the pattern
   *    "municipalityName (provinceName)"
   * @param {String} rawString - Unprocessed string
   * @param {String} provinceName - Province name to remove from rawString
   */
  getMunicipalityName (rawString, provinceName) {
    return rawString.toString().split(`(${provinceName})`)[0].trim()
  }

  /**
   * Check if a value is a Number
   * @param {String|Number} value - String or Number value
   * @returns {Bool}
   */
  isNumber (value) {
    return !isNaN(value)
  }

  /**
   * Check if a value is a String
   * @param {String} value - String value
   * @returns {Bool}
   */
  isString (value) {
    return typeof value === typeof 'sample string'
  }

  /**
   * Check if an excel row cells (keys) contains the expected types
   * @param {Object} row - Excel row converted to Object
   * @returns {Bool}
   * @throws {Error} Cell is not a valid Number|String type
   */
  isValidRowTypes (row) {
    for (const key in this.columns) {
      const field = (['__EMPTY_9', 'CLIMPS-FF-1'].includes(key))
        ? this.getHeaderForWindspeed(key, row)
        : key

      switch (field) {
        case '__EMPTY_1':
        case '__EMPTY_2':
        case '__EMPTY_3':
        case '__EMPTY_7':
        case '__EMPTY_8':
          if (!this.isNumber(row[field])) {
            throw new Error(`Cell ${key} (${this.columns[field]}) is not a Number`)
          }
          break
        case '__EMPTY_5':
        case '__EMPTY_6':
        case '__EMPTY_9':
        case 'CLIMPS-FF-1':
          if (!this.isString(row[field])) {
            throw new Error(`Cell ${field} (${this.columns[key]}) is not a String`)
          }
          break
        default: break
      }
    }

    return true
  }

  /**
   * Check if a value on a cell is valid according to expected definitions
   * @param {String} fieldName - Excel field name
   * @param {String|Number} value - Cell value
   */
  isValidCell (fieldName, value) {
    if (this.columnChecks[fieldName] === undefined) {
      throw new Error(`${fieldName} is not a valid column`)
    }

    const target = `${fieldName} (${this.columns[fieldName]})`

    if (value === undefined) {
      throw new Error(`${target}: Cannot check an undefined value.`)
    }

    // Check types
    if (this.columnChecks[fieldName].type === String) {
      if (!this.isString(value)) {
        throw new Error(`Cell ${target} is not a String`)
      }
    }

    if (this.columnChecks[fieldName].type === Number) {
      if (!this.isNumber(value)) {
        throw new Error(`Cell ${target} is not a Number`)
      }
    }

    try {
      // Check max length
      if (value.toString().trim().length > this.columnChecks[fieldName].maxLength) {
        throw new Error(`${target} value exceeds max allowed length.`)
      }
    } catch (err) {
      throw new Error(`Error checking ${fieldName}'s max length, ${err.message}`)
    }

    // Check allowed values
    if (this.columnChecks[fieldName].values !== undefined) {
      if (!this.columnChecks[fieldName].values.includes(value)) {
        throw new Error(`Invalid value ${value} detected on ${target}.`)
      }
    }

    return true
  }

  /**
   * Extract and format relevant data from a row (Object)
   * @param {Object} row - Excel row converted to Object
   * @param {String} provinceName - Name of province
   * @returns {Object} { province, municipality, tmin, tmax, tmin, rainfall, cover, humidity, wspeed, wdirection }
   * @throws {Error} Errors that may be encountered while parsing a row
   */
  getData (row, provinceName) {
    let obj

    try {
      // Validate cells
      for (const key in this.columns) {
        const field = (['__EMPTY_9', 'CLIMPS-FF-1'].includes(key))
          ? this.getHeaderForWindspeed(key, row)
          : key
        this.isValidCell(field, row[field])
      }
    } catch (err) {
      throw new Error(err.message)
    }

    // Extract data
    try {
      obj = {
        province: provinceName,
        municipality: this.getMunicipalityName(row.__EMPTY, provinceName),
        tmin: row.__EMPTY_1,
        tmax: row.__EMPTY_2,
        tmean: row.__EMPTY_3,
        rainfall: row.__EMPTY_5,
        cover: row.__EMPTY_6,
        humidity: row.__EMPTY_7,
        wspeed: row.__EMPTY_8,
        wdirection: (row.__EMPTY_9 !== undefined)
          ? row.__EMPTY_9
          : (row['CLIMPS-FF-1'] !== undefined)
            ? row['CLIMPS-FF-1']
            : '-'
      }

      return obj
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = TenDayExcel
