const ExcelTabDefinition = require('./excelsheetdefv2')
const { RECOMMEDATIONS_TYPE } = require('../lib/constants')

class SpecialTab extends ExcelTabDefinition {
  constructor (crop) {
    super()
    this.crop = crop
    this.excelTabNumber = 5
    this.type = RECOMMEDATIONS_TYPE.SPECIAL
    this.description = 'Special Weather Crop Recommendations'

    this.EXCEL_COLUMN_NAMES = {
      'Wind Signal': this.NORMAL_COLUMN_NAMES.WIND_SIGNAL,
      'Impact Outlook': this.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH,
      __EMPTY: this.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG,
      'Management Recommendations': this.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_ENGLISH,
      __EMPTY_1: this.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_TAGALOG
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
