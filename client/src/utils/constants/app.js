const REPORT_TYPE = {
  SEASONAL: 'seasonal',
  TEN_DAY: 'ten_day',
  SPECIAL_WEATHER: 'special_weather'
}

const APP_STATES = {
  VIEW: 'view',
  SAVE: 'save',
  EDIT: 'edit',
  DELETE: 'delete'
}

const MSG_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

const REPORT_TITLE = {
  [REPORT_TYPE.SEASONAL]: 'Regional Seasonal Climate Outlook and Advisory',
  [REPORT_TYPE.TEN_DAY]: '10-Day Farm Weather Outlook and Advisory',
  [REPORT_TYPE.SPECIAL_WEATHER]: 'Special Weather Advisory'
}

const DEFAULT_REPORT_DIALOGS = {
  title: 'Save report',
  msg: 'Do you want to save this report?',
  error: '',
  docId: '',
  loading: false,
  isOpen: false,
  savesuccess: false
}

export {
  APP_STATES,
  MSG_TYPES,
  REPORT_TYPE,
  REPORT_TITLE,
  DEFAULT_REPORT_DIALOGS
}
