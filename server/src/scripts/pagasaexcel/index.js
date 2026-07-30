const path = require('path')
const {
  ExcelFile,
  MinMax,
  Rainfall,
  NormalRainfall,
  DryWet
} = require('./classes')

const { delFile } = require('../../utils/file')

/**
 * Extracts and formats seasonal weather forecast data from PAGASA's excel file
 * @param {String} filePath - full system file path and file name of an excel file
 * @returns {Promise} Resolves to an object containing the minmax, rainfall and drydays data for (6) months grouped by province
 */
const pagasaExcelParser = async (filePath) => {
  try {
    const excelFilePath = (filePath) || path.join(__dirname, '..', 'data', 'pagasa_seasonal_v2.xlsx')

    // Excel file
    const excelFile = new ExcelFile(excelFilePath)

    // Min/Max/Mean data (1st excel tab)
    const minMaxData = new MinMax({ allowNoData: true })
    minMaxData.setData(excelFile.getDataSheet(0))

    // Rainfall data (1st excel tab)
    const rainfallData = new Rainfall({ allowNoData: true })
    rainfallData.setData(excelFile.getDataSheet(0))

    // Normal rainfall data (1st excel tab)
    const normalData = new NormalRainfall({ allowNoData: true })
    normalData.setData(excelFile.getDataSheet(0))

    // Dry/Wet days data (2nd excel tab)
    const dryWetData = new DryWet({ allowNoData: true })
    dryWetData.setData(excelFile.getDataSheet(1))

    // Delete the uploaded Excel file
    await delFile(filePath)

    return {
      minmax: minMaxData.getData(),
      rainfall: rainfallData.getData(),
      normal: normalData.getData(),
      drydays: dryWetData.getData()
    }
  } catch (err) {
    throw new Error(`Error reading file excel file - ${err.message}`)
  }
}

module.exports = pagasaExcelParser
