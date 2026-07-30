const { MONTHS, PROVINCE_LIST_LOWERCASE } = require('../../utils/constants')
const { validateMonthsSequence, isNumber, isString, isMonth } = require('../../utils/helpers')

/**
 * Common fields and methods for PAGASA's seasonal weather data excel file parser.
 * This is a "parent" class for inheriting subclasses.
 * See the /data/pagasa_seasonal_v2.xlsx file for excel file reference
 */
class Seasonal {
  /**
   * Sets the superclass constructor parameters
   * @typedef {Object} params - Class constructor parameters
   * @param {Bool} allowNoData - Flag to allow the "nda" string value for "no data available" Number values. Excel cells with "nda" values will be uploaded as null values to the Firestore DB.
   */
  constructor (params) {
    this.TOTAL_NUM_MONTHS = 6
    this.BICOL_PROVINCES_COUNT = PROVINCE_LIST_LOWERCASE.length
    this.MONTHS = []
    this.MOTHS_YEARS = []
    this.EXCEL_COLNAMES_TO_MONTHS = {}
    this.validated = false

    // "nda" means no data is available for the given input: it's not 0 or (-1)
    this.NO_DATA_AVAILABLE = 'nda'
    this.ALLOW_NO_DATA_VALUE = params?.allowNoData ?? false

    this.utils = {
      // Allow "nda" string indicating a null or not available numerical data value if this.ALLOW_NO_DATA_VALUE
      isNumber: (value) => {
        if (!this.ALLOW_NO_DATA_VALUE) {
          return isNumber(value)
        } else {
          return (isNumber(value) || value === this.NO_DATA_AVAILABLE)
        }
      },
      // Strict checking for Number values
      isNumberStrict: isNumber,
      isString,
      isMonth
    }

    this.data = []
  }

  /**
   * Set and validate the raw JSON data read by xlsx
   * @param {Object[]} data
   */
  setData (data) {
    this.data = data
    this.validate()
  }

  /**
   * Return a formatted JSON data structure
   */
  getData () {
    /** Override and call super.getData() from inheriting classes */
    if (!this.validated) {
      throw new Error('Must call the validate() method first.')
    }
  }

  validate () {
    /** Override and call super.validate() on custom validation methods from inheriting classes */
    this.validated = true
  }

  /**
   * Check if the JSON object corresponding to an excel row is valid
   * @param {Object} row
   * @returns {Bool}
   */
  isValidRow (row) {
    /** Override this method with custom validation logic from inheriting classes */
    return true
  }

  /**
   * Check if the months entries in the min/max table and rainfall table are valid.
   * Months are not expected to be written in ascending in order but their values are
   * Sets the extracted (valid) months if table column headers are valid.
   * @param {String[]} monthsList - Months written in full or abbreviated names
   * @param {Bool} isAbbrev - Months in monthsList[] are written in abbreviation i.e., 'Jan', 'Jul', 'Aug', ...
   * @throws {Error} Invalid months message
   * @returns {Bool}
   */
  validMonths (monthsList, isAbbrev = false) {
    // Full or abbrev month names reference
    const key = (isAbbrev) ? 'abbrev' : 'full'
    const fullMonths = MONTHS.map(mo => mo[key].toUpperCase())

    // Extract month names
    const months = monthsList
      .map(item => item.trim())
      .filter(item => fullMonths.includes(item))

    if (months.length !== this.TOTAL_NUM_MONTHS) {
      throw new Error('Invalid number of months')
    }

    try {
      this.MONTHS = validateMonthsSequence(
        months.map(item => item.toLowerCase()),
        this.TOTAL_NUM_MONTHS,
        isAbbrev)

      const now = new Date()
      let year = now.getFullYear()

      // Set each month's year relative to the current year the Excel file is uploaded
      this.MOTHS_YEARS = this.MONTHS.reduce((acc, month, id) => {
        if (month === 'January' && id > 0) {
          year += 1
        }

        const obj = {
          id,
          month,
          year
        }

        acc.push(obj)
        return acc
      }, [])
    } catch (err) {
      throw new Error(err.message)
    }

    return true
  }
}

module.exports = Seasonal
