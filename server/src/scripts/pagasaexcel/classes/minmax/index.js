const Seasonal = require('../seasonal')
const { PROVINCE_LIST_LOWERCASE } = require('../../utils/constants')

/**
 * Excel file parser for PAGASA's seasonal weather outlook data.
 * Extracts and parses: Min/Max/Mean table data on the excel file's 1st tab, upper table
 * See the /data/pagasa_seasonal_v2.xlsx file for excel file reference
*/
class MinMax extends Seasonal {
  constructor (params) {
    super(params)
    this.MAX_MEAN_COLS = 19
    this.EXCEL_DATA_COLS = ['__EMPTY']

    for (let i = 1; i <= 11; i += 1) {
      this.EXCEL_DATA_COLS.push(`__EMPTY_${i}`)
    }
  }

  validate () {
    try {
      this.validTableHeadersCount(this.data[0])
      this.validMonths(Object.keys(this.data[0]))
    } catch (err) {
      throw new Error(err.message)
    }

    super.validate()
  }

  /**
   * Check if the number of table column headers are valid.
   * @param {Object} tableColHeaders
   * @throws {Error} Invalid headers message
   */
  validTableHeadersCount (tableColHeaders) {
    if (Object.keys(tableColHeaders).length !== this.MAX_MEAN_COLS) {
      throw new Error('Invalid number of min/max/mean table column headers')
    }

    // Normalize month names
    for (const key in tableColHeaders) {
      if (!key.includes('PROVINCE') && !key.includes('__EMPTY')) {
        const monthName = key.trim()

        if (!this.utils.isMonth(monthName)) {
          throw new Error('Invalid month name')
        }

        this.EXCEL_COLNAMES_TO_MONTHS[monthName] = key
      }
    }

    return true
  }

  /**
   * Check if a min/main/mean data row is valid
   * @param {Object} row - JSON-convered excel row by xlsx
   * @returns {Bool}
   */
  isValidRow (row) {
    let valid = true

    if (Object.keys(row).length !== this.MAX_MEAN_COLS) {
      // throw new Error(`Invalid number of columns on min/max/mean row ${row.PROVINCE}`)
      valid = false
    }

    const dataColumns = Object.keys(row).filter(key => key.startsWith('__EMPTY'))

    if (dataColumns.length !== (this.MAX_MEAN_COLS - this.TOTAL_NUM_MONTHS - 1)) {
      // throw new Error(`Missing data columns on min/max/mean row ${row.PROVINCE}`)
      valid = false
    }

    // Validate numeric values and test for undefined or null
    for (let i = 0; i < this.EXCEL_DATA_COLS.length; i += 1) {
      if (!row[this.EXCEL_DATA_COLS[i]]) {
        valid = false
        break
      }

      if (!this.utils.isNumber(row[this.EXCEL_DATA_COLS[i]])) {
        valid = false
        break
      }
    }

    // Validate numeric values hiding in months column labels and test for undefined or null
    for (let i = 0; i < this.MONTHS; i += 1) {
      if (!row[this.MONTHS[i].toUpperCase()]) {
        valid = false
        break
      }

      if (!this.utils.isNumber(row[this.MONTHS[i].toUpperCase()])) {
        valid = false
        break
      }
    }

    // Validate province name
    if (row.PROVINCE === undefined) {
      valid = false
    } else {
      if (!PROVINCE_LIST_LOWERCASE.includes(row.PROVINCE.toLowerCase())) {
        valid = false
      }
    }

    return valid
  }

  /**
   * Extract and format the min/max/mean table data into an organized JSON structure
   * @param {Object[]} data - JSON-converted excel rows by xlsx
   * @returns {Object} structured JSON formating of the min/max/mean excel table data, i.e.
   *    {
   *      ALBAY: [{ id: 0, month: 'October', min: 1, max: 2, mean: 3 }, ... ]
   *      MASBATE: [{ id: 0, month: 'October', min: 1, max: 2, mean: 3 }, ... ]
   *      ...
   *    }
   * @throws {Error} Error message
   */
  getData () {
    super.getData()

    const minmax = {}
    let error = ''

    // Return null if value is "nda"
    const returnNullForNdaString = (value) => {
      return (value === this.NO_DATA_AVAILABLE)
        ? null
        : value
    }

    for (let i = 1; i <= this.BICOL_PROVINCES_COUNT; i += 1) {
      if (!this.isValidRow(this.data[i])) {
        error = `Invalid col name or row values on row #${i}`
        break
      }

      let columnIndex = 0
      minmax[this.data[i].PROVINCE] = []

      this.MONTHS.forEach((month, index) => {
        const excelMonth = this.EXCEL_COLNAMES_TO_MONTHS[month.toUpperCase()]

        if (this.data[i][excelMonth] === undefined) {
          throw new Error(`Undefined month on row ${i}`)
        } else {
          const min = (columnIndex === 0)
            ? '__EMPTY'
            : `__EMPTY_${columnIndex}`

          const mean = (columnIndex === 0)
            ? '__EMPTY_1'
            : `__EMPTY_${columnIndex + 1}`

          const obj = {
            id: index,
            month,
            min: returnNullForNdaString(this.data[i][excelMonth]),
            max: returnNullForNdaString(this.data[i][min]),
            mean: returnNullForNdaString(this.data[i][mean])
          }

          if (!this.utils.isNumber(obj.min) || !this.utils.isNumber(obj.max) || !this.utils.isNumber(obj.mean)) {
            throw new Error('Not a number')
          }

          minmax[this.data[i].PROVINCE].push(obj)
          columnIndex += 2
        }
      })
    }

    if (error !== '') {
      throw new Error(error)
    }

    return minmax
  }
}

module.exports = MinMax
