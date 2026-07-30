const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')

class SpecialTab extends ExcelTabDefinition {
  constructor (crop) {
    super()
    this.crop = crop
    this.excelTabNumber = 6
    this.type = RECOMMEDATIONS_TYPE.SPECIAL_SMS
    this.description = 'Special Weather Crop Recommendations SMS'

    this.EXCEL_COLUMN_NAMES = {
      'Wind Signal': this.NORMAL_COLUMN_NAMES.WIND_SIGNAL,
      SMS: this.NORMAL_COLUMN_NAMES.SMS
    }

    /** Normalized wind signal codes */
    this.NORMAL_WIND_SIGNAL_CODES = {
      'General (No Signal)': 'general_no_signal',
      'Signal No. 1': 'signal_number_1',
      'Signal No. 2': 'signal_number_2',
      'Signal No. 3': 'signal_number_3',
      'Signal No. 4': 'signal_number_4',
      'Signal No. 5': 'signal_number_5'
    }
  }
}

module.exports = SpecialTab
