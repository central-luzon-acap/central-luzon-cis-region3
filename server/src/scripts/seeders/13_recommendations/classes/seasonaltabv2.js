const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')
const { CROP_STAGE_LABELS_V2 } = require('../../12_cropping_calendar/lib/constants')

class SeasonalTab extends ExcelTabDefinition {
  constructor (crop, stages) {
    super()
    this.crop = crop
    this.excelTabNumber = 2
    this.type = RECOMMEDATIONS_TYPE.SEASONAL
    this.description = 'Seasonal Crop Recommendations'

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
    this.NORMAL_CLIMATE_RISK_CODES = {
      'No Risk': 'no_risk',
      Drought: 'drought',
      'Dry Condition': 'dry_condition',
      'Dry Spell': 'dry_spell',
      'Wet Condition': 'wet_condition',
      'Wet Spell': 'wet_spell'
    }

    this.NORMAL_CROPSTAGE_CODES = stages ?? CROP_STAGE_LABELS_V2[this.crop]
  }
}

module.exports = SeasonalTab
