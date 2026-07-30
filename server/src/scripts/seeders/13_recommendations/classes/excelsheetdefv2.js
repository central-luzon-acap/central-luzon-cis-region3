class ExcelTabDefinition {
  /** Excel sheet tab number */
  excelTabNumber = -1

  /** Recommendations type */
  type = ''

  /** Minimal text description */
  description = ''

  /** Raw excel column names */
  EXCEL_COLUMN_NAMES = {}

  /** Normalized excel column names */
  NORMAL_COLUMN_NAMES = {
    CROP_STAGE: 'crop_stage',
    FARMING_ACTIVITY: 'farming_activity',
    CLIMATE_RISK: 'climate_risk',
    IMPACT_OUTLOOK_ENGLISH: 'impact_outlook_english',
    IMPACT_OUTLOOK_TAGALOG: 'impact_outlook_tagalog',
    MANAGEMENT_RECOMMENDATIONS_ENGLISH: 'management_recommendations_english',
    MANAGEMENT_RECOMMENDATIONS_TAGALOG: 'management_recommendations_tagalog',
    RISK: 'risk',
    SMS: 'sms',
    WIND_SIGNAL: 'wind_signal'
  }
}

module.exports = ExcelTabDefinition
