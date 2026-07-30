const path = require('path')
const {
  ExcelFile,
  MinMax,
  Rainfall,
  NormalRainfall,
  DryWet
} = require('./classes')

const main = () => {
  try {
    // Excel file
    const excelFile = new ExcelFile(path.join(__dirname, '..', 'data', 'pagasa_seasonal_v2.xlsx'))

    // Min/Max/Mean data (1st excel tab, 1st table)
    const minMaxData = new MinMax({ allowNoData: true })
    minMaxData.setData(excelFile.getDataSheet(0))
    const data = minMaxData.getData()

    // Rainfall data (1st excel tab, 2nd table)
    const rainfallData = new Rainfall({ allowNoData: true })
    rainfallData.setData(excelFile.getDataSheet(0))
    const rdata = rainfallData.getData()

    // Normal rainfall data (1st excel tab, 3rd table)
    const normalData = new NormalRainfall({ allowNoData: true })
    normalData.setData(excelFile.getDataSheet(0))
    const nData = normalData.getData()

    // Dry/Wet days data (2nd excel tab)
    const dryWetData = new DryWet({ allowNoData: true })
    dryWetData.setData(excelFile.getDataSheet(1))
    const wdata = dryWetData.getData()

    console.log(data, rdata, wdata, nData)
  } catch (err) {
    throw new Error(`Error reading file excel file - ${err.message}`)
  }
}

main()
