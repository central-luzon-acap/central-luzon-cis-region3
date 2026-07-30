const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')

class SeasonalTab extends ExcelTabDefinition {
  constructor (crop) {
    super()
    this.crop = crop
    this.excelTabNumber = 4
    this.type = RECOMMEDATIONS_TYPE.SEASONAL_SMS
    this.description = 'Seasonal Crop Recommendations SMS'

    this.EXCEL_COLUMN_NAMES = {
      'Climate Risk': this.NORMAL_COLUMN_NAMES.CLIMATE_RISK,
      SMS: this.NORMAL_COLUMN_NAMES.SMS
    }

    /** Normalized weather climate risk codes */
    this.NORMAL_CLIMATE_RISK_SEASONAL_SMS_CODES = {
      'No Risk': 'no_risk',
      'Dry Condition': 'dry_condition',
      'Dry Spell 3B': 'dry_spell_3B',
      'Dry Spell 2WB': 'dry_spell_2WB',
      'Drought 3WB': 'drought_3WB',
      'Drought 5B': 'drought_5B',
      'Wet Condition': 'wet_condition',
      'Wet Spell': 'wet_spell'
    }
  }
}

module.exports = SeasonalTab
