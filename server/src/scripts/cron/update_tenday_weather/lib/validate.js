const XLSX = require('xlsx')
const { ExcelFile } = require('ph-municipalities')
const dayjs = require('dayjs')
const writeCsv = require('../../../../utils/csv_writer')

/**
 * Validates a 10-day excel file
 * Extract data defined in TenDayExcel into Object[] or CSV file
 * @param {String} excelFile - Excel file complete with full path
 * @param {TenDayExcel} ExcelDefinition - An instance of TenDayExcel initialized with a target region
 * @param {Number} dayNum - excel file's day number
 * @param {Bool} tocsv - Write processed/filtered data to a CSV file
 */
const validateExcel = async ({ REGION_LOCATIONS, excelFile, ExcelDefinition, dayNum = 0, tocsv = false }) => {
  // SheetJS (xlsx) objects
  let workbook
  let sheets
  let data

  // Forecast date
  let fDate

  // Date range validity period
  let dateRange

  if (ExcelDefinition === undefined) {
    throw new Error('Missing parameter(s).')
  }

  try {
    workbook = XLSX.readFile(excelFile)
    sheets = workbook.SheetNames
    data = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]])
  } catch (err) {
    throw new Error(`Error reading file [${excelFile}] - ${err.message}`)
  }

  // Check if target columns exist on a random data row
  try {
    ExcelDefinition.allColumnsExist(data[10])
  } catch (err) {
    throw new Error(`[${excelFile}] - ${err.message}`)
  }

  // Extract and validate forecast date
  try {
    fDate = ExcelDefinition.getForecastDate(Object.keys(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Extract and validate date range validity period
  try {
    dateRange = ExcelDefinition.getDateRange(Object.values(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Filter and parse all rows belonging to defined provinces in ExcelDefinition
  let temp = data.filter(x => (x.__EMPTY !== undefined && ExcelDefinition.getProvince(x.__EMPTY) !== undefined))

  // Filter to include only specified municipalities
  if (ExcelDefinition.municipalities.length > 0) {
    temp = temp.filter(row => ExcelDefinition.municipalities.find(municipality => {
      // Original municipality from Excel
      const rowMunicipality = row.__EMPTY.toString().trim()

      if (ExcelFile.hasSpecialChars(rowMunicipality)) {
        const cMunicipality = ExcelFile.removeGarbledText(rowMunicipality)

        // Compare normalized/clean municipality
        return cMunicipality.includes(municipality)
      } else {
        return rowMunicipality.includes(municipality)
      }
    }))
  }

  // Constant start date range references
  const dateStart = ExcelDefinition.getForecastStartDate(dateRange)

  const startMonth = dateStart.getMonth() + 1
  const startYear = dateStart.getFullYear()
  const maxMonthDays = ExcelDefinition.getMaxDaysInMonth(startYear, dateStart.getMonth())

  const filteredData = temp.map((x, index) => {
    const province = ExcelDefinition.getProvince(x.__EMPTY)

    try {
      const obj = ExcelDefinition.getData(x, province)
      obj.date_forecast = fDate
      obj.date_range = dateRange
      obj.date_start = dateStart
      obj.date_start_str = dayjs(dateStart).format('YYYY/MM/DD')

      // Set the formatted Date string
      let day = dateStart.getDate() + dayNum - 1
      let monthNum = startMonth
      let yearNum = startYear

      if (day > maxMonthDays) {
        day = day - maxMonthDays
        yearNum = (monthNum + 1 <= 12)
          ? yearNum
          : yearNum + 1
        monthNum = (monthNum + 1 <= 12)
          ? monthNum + 1
          : 1
      }

      // Format the days in human-readable (shorthand) format
      const formattedDate = new Date(`${monthNum} ${day}, ${yearNum}`).toDateString()
      obj.day_format = formattedDate.substring(0, formattedDate.length - 5)
      obj.day_str = dayjs(formattedDate).format('YYYY/MM/DD')

      // Validate province
      if (!Object.keys(REGION_LOCATIONS.data).includes(province)) {
        throw new Error(`${province} province is not supported at the moment.`)
      }

      // Validate municipality
      const cleanMunicipality = (ExcelFile.hasSpecialChars(obj.municipality))
        ? ExcelFile.removeGarbledText(obj.municipality)
        : obj.municipality

      obj.municipality = cleanMunicipality

      if (!REGION_LOCATIONS.data[province].includes(cleanMunicipality)) {
        throw new Error(`${cleanMunicipality} is not a municipality under the ${province} province.`)
      }

      return obj
    } catch (err) {
      throw new Error(`[${excelFile}], row #${index}, error extracting row object (${x.__EMPTY}) - ${err.message}`)
    }
  })

  if (filteredData.length > 0) {
    if (tocsv) {
      await writeCsv(filteredData, excelFile.replace('.xlsx', '.csv'))
    }

    return filteredData
  } else {
    throw new Error(`[${excelFile}] No data are extracted.`)
  }
}

module.exports = validateExcel
