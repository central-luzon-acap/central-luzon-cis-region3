const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')

class TendayTabSMS extends ExcelTabDefinition {
  constructor (crop) {
    super()
    this.crop = crop
    this.excelTabNumber = 1
    this.type = RECOMMEDATIONS_TYPE.TENDAY_SMS
    this.description = '10-Day Crop Recommendations SMS'

    this.EXCEL_COLUMN_NAMES = {
      'Climate Risk': this.NORMAL_COLUMN_NAMES.CLIMATE_RISK,
      SMS: this.NORMAL_COLUMN_NAMES.SMS
    }

    /** Normalized weather climate risk codes */
    this.NORMAL_CLIMATE_RISK_TENDAY_SMS_CODES = {
      'No Risk': 'no_risk',
      'Water Shortage Risk 5N': 'water_shortage_risk_5n',
      'Water Shortage Risk 10L': 'water_shortage_risk_10l',
      'Flooding/Submergence 3M': 'flooding_submergence_3m',
      'Flooding/Submergence 2H': 'flooding_submergence_2h'
    }
  }
}

module.exports = TendayTabSMS
