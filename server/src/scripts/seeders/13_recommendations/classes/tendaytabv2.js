const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')
const { CROP_STAGE_LABELS_V2 } = require('../../12_cropping_calendar/lib/constants')

class TendayTab extends ExcelTabDefinition {
  constructor (crop, stages) {
    super()
    this.crop = crop
    this.excelTabNumber = 0
    this.type = RECOMMEDATIONS_TYPE.TENDAY
    this.description = '10-Day Crop Recommendations'

    this.EXCEL_COLUMN_NAMES = {
      'Crop Stage': this.NORMAL_COLUMN_NAMES.CROP_STAGE,
      'Farming Activity': this.NORMAL_COLUMN_NAMES.FARMING_ACTIVITY,
      'Climate Risk': this.NORMAL_COLUMN_NAMES.CLIMATE_RISK,
      'Impact Outlook': this.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH,
      __EMPTY: this.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG,
      'Management Recommendations': this.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_ENGLISH,
      __EMPTY_1: this.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_TAGALOG
    }

    /** Normalized weather climate risk codes */
    this.NORMAL_CLIMATE_RISK_TENDAY_CODES = {
      'No Risk': 'no_risk',
      'Water Shortage Risk': 'water_shortage_risk',
      'Flooding/Submergence Risk': 'flood_submergence_risk'
    }

    this.NORMAL_CROPSTAGE_CODES = stages ?? CROP_STAGE_LABELS_V2[this.crop]
  }
}

module.exports = TendayTab
