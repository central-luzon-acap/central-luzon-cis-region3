const Seasonal = require('../seasonal')
const { PROVINCE_LIST_LOWERCASE, MONTHS } = require('../../utils/constants')

/**
 * Excel file parser for PAGASA's seasonal weather outlook data.
 * Extracts and parses: dry/wet dats table data on the excel file's 2nd tab
 * See the /data/pagasa_seasonal_v2.xlsx file for excel file reference
*/
class DryWet extends Seasonal {
  constructor (params) {
    super(params)
    this.MAX_DRYWET_COLS = 19
    this.EXTRA_SPACE_COLS = 2
    this.DRYWET_DATA_START_ROW = 2

    // Map the (messy) excel table column header names with their corresponding month
    // Colums for "forecast" start on "FORECAST", next is on __EMPTY_7 up to __EMPTY_11
    this.EXCEL_DATA_COLS = ['FORECAST']

    for (let i = 7; i <= 11; i += 1) {
      this.EXCEL_DATA_COLS.push(`__EMPTY_${i}`)
    }
  }

  validate () {
    try {
      this.validTableHeadersCount(this.data[0])

      // Validate months. Months are written in abbrevation on this excel tab
      const months = Object.values(this.data[0])
        .map(x => x.trim())
        .filter((x, i, a) => a.indexOf(x) === i)

      this.validMonths(months, true)
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
    if (Object.keys(tableColHeaders).length !== this.MAX_DRYWET_COLS) {
      throw new Error('Invalid number of dry/wet days table column headers')
    }

    for (const key in tableColHeaders) {
      const monthName = tableColHeaders[key].trim()

      if (monthName !== 'PROVINCE') {
        if (!this.utils.isMonth(monthName, true)) {
          throw new Error('Incorrect month name.')
        }
      }

      if (this.EXCEL_DATA_COLS.includes(key) && this.EXCEL_COLNAMES_TO_MONTHS[monthName] === undefined) {
        this.EXCEL_COLNAMES_TO_MONTHS[monthName] = key
      }
    }

    // Get the 'PROVINCE' excel column name
    const ambigousProvinceKey = Object.keys(tableColHeaders).find(key => tableColHeaders[key] === 'PROVINCE')

    // Validate the province column
    if (!ambigousProvinceKey) {
      throw new Error('Province column is undefined')
    } else {
      this.EXCEL_COLNAMES_TO_MONTHS[ambigousProvinceKey] = 'PROVINCE'
    }

    // Validate the numeric forecast columns

    return true
  }

  /**
   * Check if a min/main/mean data row is valid
   * @param {Object} row - JSON-convered excel row by xlsx
   * @returns {Bool}
   */
  isValidRow (row) {
    let valid = true

    if (Object.keys(row).length !== this.MAX_DRYWET_COLS) {
      // throw new Error(`Invalid number of columns on min/max/mean row ${row.PROVINCE}`)
      // NOTE: Remove this check because its inconsistent with the no. of column headers
      // valid = false
    }

    const dataColumns = Object.keys(row).filter(key => key.startsWith('__EMPTY'))

    if (dataColumns.length !== this.MAX_DRYWET_COLS - this.EXTRA_SPACE_COLS - 1) {
      // throw new Error(`Missing data columns on min/max/mean row ${row.PROVINCE}`)
      // NOTE: Remove this check because its inconsistent with the no. of column headers
      // valid = false
    }

    // Validate cells
    for (const key in this.EXCEL_COLNAMES_TO_MONTHS) {
      const keyValue = this.EXCEL_COLNAMES_TO_MONTHS[key]

      switch (keyValue) {
        case '__EMPTY_7':
        case '__EMPTY_8':
        case '__EMPTY_9':
        case '__EMPTY_10':
        case '__EMPTY_11':
        case 'FORECAST':
          if (row[keyValue] === undefined) {
            valid = false
          }

          if (!this.utils.isNumber(row[keyValue])) {
            // throw new Error('Not a number')
            valid = false
          }
          break
        case 'PROVINCE':
          if (row[key] === undefined) {
            valid = false
          }

          if (!this.utils.isString(row[key])) {
            // throw new Error('Not a string')
            valid = false
          }

          if (!PROVINCE_LIST_LOWERCASE.includes(row[key].trim().toLowerCase())) {
            valid = false
          }
          break
        default: break
      }
    }

    return valid
  }

  /**
   * Extract and format the forecast rainfall table data into an organized JSON structure
   * @param {Object[]} data - JSON-converted excel rows by xlsx
   * @returns {Object} structured JSON formating of the min/max/mean excel table data, i.e.
   *    {
   *      ALBAY: [{ id: 0, month: 'October', rainfall: 12 }, ... ]
   *      MASBATE: [{ id: 0, month: 'October', rainfall: 3 }, ... ]
   *      ...
   *    }
   * @throws {Error} Error message
   */
  getData () {
    super.getData()

    const drywetdata = {}
    let error = ''

    for (let i = this.DRYWET_DATA_START_ROW; i < (this.BICOL_PROVINCES_COUNT + this.DRYWET_DATA_START_ROW); i += 1) {
      if (!this.isValidRow(this.data[i])) {
        error = `Invalid col name or row values on row #${i}`
        break
      }

      const provinceExcelCol = Object.keys(this.EXCEL_COLNAMES_TO_MONTHS).find(key => this.EXCEL_COLNAMES_TO_MONTHS[key] === 'PROVINCE')
      drywetdata[this.data[i][provinceExcelCol]] = []

      this.MONTHS.forEach((month, index) => {
        const abbrev = MONTHS.find(mo => mo.full === month).abbrev
        const excelCol = this.EXCEL_COLNAMES_TO_MONTHS[abbrev.toUpperCase()]

        if (this.data[i][excelCol] === undefined) {
          throw new Error(`Undefined month on row ${i}`)
        } else {
          const obj = {
            id: index,
            month,
            forecast: (this.data[i][excelCol] === this.NO_DATA_AVAILABLE)
              ? null
              : this.data[i][excelCol]
          }

          if (!this.utils.isNumber(obj.forecast)) {
            throw new Error('Not a number')
          }

          drywetdata[this.data[i][provinceExcelCol]].push(obj)
        }
      })
    }

    if (error !== '') {
      throw new Error(error)
    }

    return drywetdata
  }
}

module.exports = DryWet
