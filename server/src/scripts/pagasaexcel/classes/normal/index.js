const Seasonal = require('../seasonal')
const { PROVINCE_LIST_LOWERCASE } = require('../../utils/constants')

/**
 * Excel file parser for PAGASA's seasonal weather outlook data.
 * Extracts and parses: normal forecast raintall table data on the excel file's 1st tab, 3rd (lowest) table
 * See the /data/pagasa_seasonal_v2.xlsx file for excel file reference
*/
class NormalRainfall extends Seasonal {
  constructor (params) {
    super(params)

    this.MAX_NORMAL_COLS = 7
    this.NORMAL_DATA_START_ROW = -1
    // this.NORMAL_DATA_START_ROW = 19 --> Starting index for R5

    // This text is the starting point of the "Normal" Rainfall headers and rows of Normal data from the parsed JSON excel data
    // with reference to the pagasa_seasonal_v2.xlsx template
    this.EXCEL_KEYWORD = 'Normal Rainfall'
  }

  validate () {
    try {
      // this.validTableHeadersCount(this.data[17]) ---> R5
      // this.validMonths(Object.values(this.data[17]))

      const FLAG_ROW_INDEX = this.data
        .findIndex(item => item?.PROVINCE?.includes(this.EXCEL_KEYWORD))

      if (FLAG_ROW_INDEX === -1) {
        throw new Error(`Cannot find the "${this.EXCEL_KEYWORD}" text`)
      }

      // Steps from FLAG_ROW_INDEX is highly reliant in the structure of the pagasa_seasonal_v2.xlsx template
      const HEADER_STEPS_FROM_FLAG = 1
      const DATA_STEPS_FROM_FLAG = 3

      // Array index where the normal headers start
      const ROW_START_HEADER = FLAG_ROW_INDEX + HEADER_STEPS_FROM_FLAG

      // Array index where the normal data start
      this.NORMAL_DATA_START_ROW = FLAG_ROW_INDEX + DATA_STEPS_FROM_FLAG

      this.validTableHeadersCount(this.data[ROW_START_HEADER])
      this.validMonths(Object.values(this.data[ROW_START_HEADER]))
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
    if (Object.keys(tableColHeaders).length !== this.MAX_NORMAL_COLS) {
      throw new Error('Invalid number of min/max/mean table column headers')
    }

    // Map the (messy) excel table column header names with their corresponding month
    for (const key in tableColHeaders) {
      if (key !== 'PROVINCE') {
        const monthName = tableColHeaders[key].trim()

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
    const excelColNames = Object.values(this.EXCEL_COLNAMES_TO_MONTHS)
    let valid = true

    if (Object.keys(row).length !== this.MAX_NORMAL_COLS) {
      valid = false
    }

    // Check cells for numeric and undefined values
    for (let i = 0; i < excelColNames.length; i += 1) {
      if (row[excelColNames[i]] === undefined) {
        valid = false
        break
      }

      if (!this.utils.isNumber(row[excelColNames[i]])) {
        valid = false
        break
      }
    }

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
   * Extract and format the normal rainfall table data into an organized JSON structure
   * @param {Object[]} data - JSON-converted excel rows by xlsx
   * @returns {Object} structured JSON formating of the normal rainfall excel table data, i.e.
   *    {
   *      ALBAY: [{ id: 0, month: 'October', normal: 12 }, ... ]
   *      MASBATE: [{ id: 0, month: 'October', normal: 3 }, ... ]
   *      ...
   *    }
   * @throws {Error} Error message
   */
  getData () {
    super.getData()

    const normaldata = {}
    let error = ''

    if (this.NORMAL_DATA_START_ROW === -1) {
      throw new Error(`${this.EXCEL_KEYWORD} data starting point not initialized`)
    }

    for (let i = this.NORMAL_DATA_START_ROW; i < (this.NORMAL_DATA_START_ROW + this.BICOL_PROVINCES_COUNT); i += 1) {
      if (!this.isValidRow(this.data[i])) {
        error = `Invalid col name or row values on row #${i}`
        break
      }

      normaldata[this.data[i].PROVINCE] = []

      this.MONTHS.forEach((month, index) => {
        if (this.data[i][this.EXCEL_COLNAMES_TO_MONTHS[month.toUpperCase()]] === undefined) {
          throw new Error(`Undefined month on row ${i}`)
        }

        const normal = this.data[i][this.EXCEL_COLNAMES_TO_MONTHS[month.toUpperCase()]]

        if (!this.utils.isNumber(normal)) {
          throw new Error('Not a number')
        }

        const obj = {
          id: index,
          month,
          normal: (normal === this.NO_DATA_AVAILABLE)
            ? null
            : normal
        }

        normaldata[this.data[i].PROVINCE].push(obj)
      })
    }

    if (error !== '') {
      throw new Error(error)
    }

    return normaldata
  }
}

module.exports = NormalRainfall
