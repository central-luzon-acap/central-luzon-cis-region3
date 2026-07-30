const REPORT = {
  UID: 'uid',
  ID: 'id',
  REGION: 'region',
  PROVINCE: 'province',
  MUNICIPALITY: 'municipality',
  TYPE: 'type',
  CROP: 'crop',
  STAGES: 'stages',
  ACTIVITIES: 'activities',
  MONTH: 'month',
  CONDITION: 'condition',
  CONDITIONS: 'conditions',
  RISK: 'risk',
  DATE_RANGE: 'date_range',
  RAINFALL: 'rainfall',
  TYPHOON: 'typhoon',
  WIND_SIGNAL: 'wind_signal',
  RECOMMENDATIONS: 'recommendations',
  SMS_RECOMMENDATIONS: 'smsRecommendations',
  UPDATED_BY: 'updated_by',
  DATE_CREATED: 'date_created'
}

const REPORT_COMMON = [
  { field: REPORT.REGION, label: 'Region' },
  { field: REPORT.PROVINCE, label: 'Province' },
  { field: REPORT.MUNICIPALITY, label: 'Municipality' },
  { field: REPORT.TYPE, label: 'Report Type' },
  { field: REPORT.CROP, label: 'Crop' }
]

const REPORT_REGULAR = [
  { field: REPORT.MONTH, label: 'Month' },
  { field: REPORT.STAGES, label: 'Crop Stage(s)' },
  { field: REPORT.ACTIVITIES, label: 'Farming Activities' },
  { field: REPORT.RISK, label: 'Climate Risk' }
]

const REPORT_SEASONAL = [
  { field: REPORT.CONDITION, label: 'Weather Condition' },
  { field: REPORT.CONDITIONS, label: 'Weather Condition' },
]

const REPORT_TENDAY = [
  { field: REPORT.DATE_RANGE, label: 'Weather data validity' },
  { field: REPORT.RAINFALL, label: 'Weather Condition' }
]

const REPORT_SPECIAL = [
  { field: REPORT.TYPHOON, label: 'Typhoon Name' },
  { field: REPORT.WIND_SIGNAL, label: 'Wind Signal No.' }
]

const MISC = {
  CROP_RECOMMENDATIONS: [
    { field: REPORT.RECOMMENDATIONS, label: 'Recommendations' },
    { field: REPORT.SMS_RECOMMENDATIONS, label: 'SMS Recommendations' }
  ],
  USER_INFO: [
    { field: REPORT.UPDATED_BY, label: 'Created by' },
    { field: REPORT.DATE_CREATED, label: 'Date created' },
    { field: REPORT.UID, label: 'User ID' },
    { field: REPORT.ID, label: 'ID' }
  ]
}

export {
  REPORT,
  REPORT_COMMON,
  REPORT_REGULAR,
  REPORT_SEASONAL,
  REPORT_TENDAY,
  REPORT_SPECIAL,
  MISC
}
