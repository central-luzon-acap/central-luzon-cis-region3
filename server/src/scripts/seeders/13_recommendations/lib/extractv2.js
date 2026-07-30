const ExcelFile = require('../../../pagasaexcel/classes/excelfile')
const { RECOMMEDATIONS_TYPE } = require('./constants')
const sanitycheck = require('./sanitycheck')

/**
 * Extract normalized recommendations data and other metadata from an excel sheet tab
 * @param {Object} ExcelTab - a subclass of the ExcelTabDefinition class
 * @param {String} excelFilePath - Full file path to an excel file
 * @returns {Object} { recommendations, cropstages, farmoperations }
 *    - {Object} recommendations - crop recommendations rows of data and other metadata
 *    - {String[]} cropstages - Unique crop stages list
 *    - {String[]} farmoperations - Unique farm operations list
 */
module.exports.extractExcelData = (ExcelTab, excelFilePath, cropName) => {
  // Read the excel file
  const excel = new ExcelFile(excelFilePath)

  // Read sheet data from excel file
  const excelData = excel.getDataSheet(ExcelTab.excelTabNumber)

  const recommendations = {
    type: ExcelTab.type,
    description: ExcelTab.description,
    date_created: ''
  }

  // Normalize and clean cell contents
  recommendations.data = excelData.reduce((list, item, index) => {
    if (index > 0) {
      const obj = {}

      for (const key in ExcelTab.EXCEL_COLUMN_NAMES) {
        let value = item[key] || ''
        value = value.trim()

        switch (ExcelTab.type) {
          case RECOMMEDATIONS_TYPE.SEASONAL:
          case RECOMMEDATIONS_TYPE.SEASONAL_GENERAL:
            // Normalize the seasonal forecast text
            if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.CLIMATE_RISK) {
              value = ExcelTab.NORMAL_CLIMATE_RISK_CODES[value]
            }

            // Change all <p> tags in NORMAL_COLUMN_NAMES.IMPACT to <li>
            if ([ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH, ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG]
              .includes(ExcelTab.EXCEL_COLUMN_NAMES[key])
            ) {
              if (value.includes('<p>')) {
                value = value.replace(/<p>/g, '<li>')
                value = value.replace(/<\/p>/g, '</li>')
              }
            }
            break
          case RECOMMEDATIONS_TYPE.TENDAY:
            // Normalize the seasonal forecast text
            if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.CLIMATE_RISK) {
              value = ExcelTab.NORMAL_CLIMATE_RISK_TENDAY_CODES[value]
            }

            // Change all <p> tags in NORMAL_COLUMN_NAMES.IMPACT to <li>
            if ([ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH, ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG]
              .includes(ExcelTab.EXCEL_COLUMN_NAMES[key])
            ) {
              if (value.includes('<p>')) {
                value = value.replace(/<p>/g, '<li>')
                value = value.replace(/<\/p>/g, '</li>')
              }
            }
            break
          case RECOMMEDATIONS_TYPE.SPECIAL:
          case RECOMMEDATIONS_TYPE.SPECIAL_SMS:
            if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.WIND_SIGNAL) {
              value = ExcelTab.NORMAL_WIND_SIGNAL_CODES[value]
            }
            break
          case RECOMMEDATIONS_TYPE.TENDAY_SMS:
            if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.CLIMATE_RISK) {
              value = ExcelTab.NORMAL_CLIMATE_RISK_TENDAY_SMS_CODES[value]
            }
            break
          case RECOMMEDATIONS_TYPE.SEASONAL_SMS:
            if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.CLIMATE_RISK) {
              value = ExcelTab.NORMAL_CLIMATE_RISK_SEASONAL_SMS_CODES[value]
            }
            break
          default: break
        }

        // Insert <span> in <li>
        switch (ExcelTab.EXCEL_COLUMN_NAMES[key]) {
          case ExcelTab.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_ENGLISH:
          case ExcelTab.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_TAGALOG:
          case ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH:
          case ExcelTab.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG:
            if (sanitycheck(value)) {
              value = value
                .replace(/<li>/g, '<li><span>')
                .replace(/<\/li>/g, '</span></li>')
            } else {
              throw new Error('HTML string contains unsupported tags')
            }
            break
          default:
            break
        }

        // Normalize the crop stage name - use crop calendar codes
        if (ExcelTab.EXCEL_COLUMN_NAMES[key] === ExcelTab.NORMAL_COLUMN_NAMES.CROP_STAGE) {
          const cropStage = value
          value = ExcelTab.NORMAL_CROPSTAGE_CODES[value]

          if (!value) {
            throw new Error(`Crop stage "${cropStage}" not defined for ${ExcelTab.type}-type recommendations`)
          }
        }

        obj[ExcelTab.EXCEL_COLUMN_NAMES[key]] = value
      }

      obj.id = list.length
      obj.crop = cropName
      list.push(obj)
    }

    return list
  }, [])

  // List unique crop stages
  const cropstages = recommendations.data.map(x => x[ExcelTab.NORMAL_COLUMN_NAMES.CROP_STAGE])
    .filter((x, i, a) => a.indexOf(x) === i)

  // List unique farm operations
  const farmoperations = recommendations.data.map(x => x[ExcelTab.NORMAL_COLUMN_NAMES.FARMING_ACTIVITY])
    .filter((x, i, a) => a.indexOf(x) === i)

  return {
    recommendations,
    cropstages,
    farmoperations
  }
}
