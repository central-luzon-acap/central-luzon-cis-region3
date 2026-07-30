const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')
const { CROP_STAGE_LABELS_V2 } = require('../../12_cropping_calendar/lib/constants')

class TendayTab extends ExcelTabDefinition {
  constructor (crop) {
    super()
    this.crop = crop
    this.excelTabNumber = 1
    this.type = RECOMMEDATIONS_TYPE.TENDAY_SMS
    this.description = '10-Day Crop Recommendations SMS'

    this.EXCEL_COLUMN_NAMES = {
      'Crop Stage': this.NORMAL_COLUMN_NAMES.CROP_STAGE,
      Risk: this.NORMAL_COLUMN_NAMES.RISK,
      SMS: this.NORMAL_COLUMN_NAMES.SMS
    }

    /** Normalized weather climate risk codes */
    this.NORMAL_CLIMATE_RISK_TENDAY_SMS_CODES = {
      'No Risk': 'no_risk',
      'Dry Condition': 'dry_condition',
      'Flooding/Submergence 3M': 'flooding_submergence_3m',
      'Flooding/Submergence 2H': 'flooding_submergence_2h'
    }

    this.NORMAL_CROPSTAGE_CODES = CROP_STAGE_LABELS_V2[this.crop]
  }
}

module.exports = TendayTab
