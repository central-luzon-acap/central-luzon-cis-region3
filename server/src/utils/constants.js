require('dotenv').config()

const ACCOUNT_LEVEL = {
  SUPERADMIN: 1,
  ADMIN: 2
}

const EMAIL_WHITELIST = process.env.EMAIL_WHITELIST.split(',')

const FIRESTORE_COLLECTIONS = {
  WEATHER_FORECAST: 'weather_forecasts',
  WEATHER_FORECAST_API: 'weather_forecasts_api',
  WEATHER_FORECAST_ARCHIVES: 'weather_archives',
  SERVICES: 'w_services',

  // Seasonal Weather Forecast
  SEASONAL: 'seasonal',

  // 10-Day Weather Forecast
  TEN_DAY: 'ten_day',

  // Special Weather Forecast
  SPECIAL_WEATHER: 'special_weather',

  // province-common regional seasonal forecast data
  SEASONAL_REGIONAL: 'seasonal_regional',

  // province-common 10-day weather forecast data
  SEASONAL_TENDAY: 'seasonal_tenday',

  SEASONAL_SPECIAL_WEATHER: 'seasonal_special_weather',

  // Crop Recommendations Masterlist
  RECOMMENDATIONS: 'n_crop_recommendations',

  CROP_RECOMMENDATIONS: {
    // Seasonal Recommendations masterlist (new)
    SEASONAL: 'n_list_crop_recommendations_seasonal',

    // 10-Day Recommendations masterlist (new)
    TENDAY: 'n_list_crop_recommendations_tenday',

    // Special Weather Recommendations masterlist (new)
    SPECIAL: 'n_list_crop_recommendations_special'
  },

  CROP_RECOMMENDATIONS_V2: {
    // Seasonal Recommendations masterlist v2
    SEASONAL: 'n_crop_recommendations_seasonal',

    // 10-Day Recommendations masterlist v2
    TENDAY: 'n_crop_recommendations_tenday',

    // Special Weather Recommendations masterlist v2
    SPECIAL: 'n_crop_recommendations_special'
  },

  CROP_RECOMMENDATIONS_SMS_V2: {
    // Seasonal Recommendations SMS masterlist v2
    SEASONAL: 'n_crop_recommendations_seasonal_sms',

    // 10-Day Recommendations SMS masterlist v2
    TENDAY: 'n_crop_recommendations_tenday_sms',

    // Special Weather Recommendations SMS masterlist v2
    SPECIAL: 'n_crop_recommendations_special_sms'
  },

  // Cropping Calendar
  CROPPING_CALENDAR: 'n_cropping_calendar_lite',
  CROPPING_CALENDAR_X: 'n_cropping_calendar_x',
  CROPPING_CALENDAR_SEASONAL_X: 'n_cropping_calendar_seasonal_x',

  // Crop Recommendations Reports
  // Contains sub-documents: "seasonal" and "ten_day",
  // each containing collections by {uid}
  REPORTS_CROPS: 'reports_crops',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS: 'bulletins_pdf_crops',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_TENDAY: 'bulletins_pdf_tenday',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_SPECIAL: 'bulletins_pdf_special',

  // Firebase Storage bucket for 10-day bulletin PDFs
  PDF_STORAGE_TENDAY: 'bulletins_tenday',

  // Firebase Storage bucket for seasonal bulletin PDFs
  PDF_STORAGE_SEASONAL: 'bulletins',

  // Firebase Storage bucket for special weather bulletin PDFs
  PDF_STORAGE_SPECIAL: 'bulletins_special',

  // Firebase Storage bucket for assets and media
  ASSETS_IMAGES: 'images',

  // Internal website files and images repository
  PAGE_ASSETS: 'n_page_assets',

  // Scraped keywords from the website's public pages for searching
  PAGE_SEARCH: 'n_page_search',

  // Global data references that may change from time to time
  CONSTANT_STATIC_DATA: 'constant_data',

  // Phonebook contacts
  PHONEBOOK: 'phonebook',

  // Error logging
  // See /classes/errorlog/constants for more info
  LOGS: 'logs'
}

const BULLETIN_TYPE = {
  CROP: 'crop',
  RISK: 'risk'
}

const REPORT_TYPE = {
  SEASONAL: 'seasonal',
  TEN_DAY: 'ten_day',
  SPECIAL: 'special_weather'
}

const FIRESTORE_DOCUMENTS = {
  TYPHOON_ADVISORY: 'typhoon_advisory',
  CYCLONE_ADVISORY: 'cyclone_advisory',
  SEASONAL_REGIONAL: {
    CYCLONES_COUNT: 'cyclones_count',
    MISC_WEATHER_SYSTEMS: 'misc_weather_systems'
  },
  SEASONAL_TENDAY: {
    MOON_PHASES: 'moon_phases'
  },
  SEASONAL_SPECIAL_WEATHER: {
    WIND_SPEED: 'wind_speed'
  },
  CONSTANT_STATIC_DATA_DOCS: {
    REGION: 'region',
    PROVINCES: 'provinces',
    AMIA_VILLAGES: 'amia_villages',
    DIFFS: 'diffs',
    PROVINCES_INFO: 'provinces_info'
  },
  CALENDAR_V2: 'calendar',
  CALENDAR_V2_STAGES: 'stages',
  LOG_TYPES: {
    CRON: 'cron'
  },
  ARCHIVES: {
    LIST: 'list'
  }
}

const MOON_PHASE_TYPE = {
  NEW_MOON: 'new_moon',
  FIRST_QUARTER: 'first_quarter',
  FULL_MOON: 'full_moon',
  LAST_QUARTER: 'last_quarter'
}

const REGION = process.env.REGION_NAME

const PROVINCE_LIST = process.env.PROVINCES.split(',')

const PROVINCE_LIST_LOWERCASE = PROVINCE_LIST.map(province => province.toLowerCase())

const PROVINCE_LIST_ARCHIVE = process.env.PROVINCES_ARCHIVE.split(',')

// Region names
const DEFAULT_PROVINCE = process.env.DEFAULT_PROVINCE

// Provinces by region
const PROVINCES = {
  [REGION]: PROVINCE_LIST
}

// Weather conditions: ciat defn's vs. PAGASA defn's
// Note: PAGASA has 'way below normal' which has no counterpart in ciat defn's

const WEATHER_CONDITION_LABELS = {
  WAY_BELOW_NORMAL: {
    label: 'wb_normal',
    label_acap: 'drier',
    sync: 'Way Below Normal',
    class: 'bg-wb_normal',
    mm: '0',
    tenday: 'NO RAIN',
    rainfall_amt_text: 'no rain is expected within the day'
  },
  BELOW_NORMAL: {
    label: 'b_normal',
    label_acap: 'normal',
    sync: 'Below Normal',
    class: 'bg-b_normal',
    mm: '<60',
    tenday: 'LIGHT RAINS',
    rainfall_amt_text: 'less than 60mm of rain within 24 hours'
  },
  NEAR_NORMAL: {
    label: 'near_normal',
    label_acap: 'normal',
    sync: 'Near normal',
    class: 'bg-near_normal',
    mm: '60-180',
    tenday: 'MODERATE RAINS',
    rainfall_amt_text: '60mm - 180mm of rain within 24 hours'
  },
  ABOVE_NORMAL: {
    label: 'above_normal',
    label_acap: 'wetter',
    sync: 'Above Normal',
    class: 'bg-above_normal',
    mm: '>180',
    tenday: 'HEAVY RAINS',
    rainfall_amt_text: 'greater than 180mm of rain within 24 hours'
  },
  NO_DATA_AVAILABLE: {
    label: 'nda',
    label_acap: 'nda',
    sync: 'No Data Available',
    class: 'bg-nda',
    mm: '',
    tenday: 'nda',
    rainfall_amt_text: 'nda'
  }
}

const WEATHER_CONDITIONS = Object.values(WEATHER_CONDITION_LABELS).map(
  (x) => x.label
)

const SEASONAL_FORECAST_MONTHS = 6

const MONTHS = {
  jan: 'January',
  feb: 'February',
  mar: 'March',
  apr: 'April',
  may: 'May',
  jun: 'June',
  jul: 'July',
  aug: 'August',
  sep: 'September',
  oct: 'October',
  nov: 'November',
  dec: 'December'
}

const MONTHS_TAGALOG = {
  jan: 'Enero',
  feb: 'Pebrero',
  mar: 'Marso',
  apr: 'Abril',
  may: 'Mayo',
  jun: 'Hunyo',
  jul: 'Hulyo',
  aug: 'Agosto',
  sep: 'Setyembre',
  oct: 'Octobre',
  nov: 'Nobyembre',
  dec: 'Disyembre'
}

const CROP_STAGES = {
  PREP: 'Land Preparation',
  PLANT: 'Planting',
  GROW: 'Growing',
  HARV: 'Harvesting'
}

const CROP_STAGES_MONTH = {
  FIRST_HALF: '1st_half', // Day 1-15 of a month
  SECOND_HALF: '2nd_half' // Day 16 to last day of a month
}

const HARD_CODED_SMS = '[This is a test run. Do not reply.] Recommendations from the ACAP-Bicol will be sent thru SMS using this account. For validation and confirmation of receipt, kindly send YES to 09173037830. Thank you and keep safe!'

// Seasonal weather forecast data manner of update
const SEASONAL_UPDATE_METHOD = {
  // Update method is from an excel file upload
  EXCEL: 'excel',
  // Update method is from manual input
  ENCODE: 'encode'
}

const WIND_SIGNAL = {
  general_no_signal: 'General (No Signal)',
  signal_number_1: 'Signal No. 1',
  signal_number_2: 'Signal No. 2',
  signal_number_3: 'Signal No. 3',
  signal_number_4: 'Signal No. 4',
  signal_number_5: 'Signal No. 5'
}

const WIND_SIGNAL_CODES = {
  SIGNAL_0: 'general_no_signal',
  SIGNAL_1: 'signal_number_1',
  SIGNAL_2: 'signal_number_2',
  SIGNAL_3: 'signal_number_3',
  SIGNAL_4: 'signal_number_4',
  SIGNAL_5: 'signal_number_5'
}

const NO_DATA_AVAILABLE = 'nda'
const NO_DATA_AVAILABLE_VALUE = null // 'nda'

module.exports = {
  ACCOUNT_LEVEL,
  CROP_STAGES,
  CROP_STAGES_MONTH,
  EMAIL_WHITELIST,
  FIRESTORE_COLLECTIONS,
  FIRESTORE_DOCUMENTS,
  PROVINCES,
  BULLETIN_TYPE,
  REPORT_TYPE,
  WEATHER_CONDITIONS,
  WEATHER_CONDITION_LABELS,
  SEASONAL_FORECAST_MONTHS,
  MONTHS,
  MONTHS_TAGALOG,
  REGION,
  DEFAULT_PROVINCE,
  HARD_CODED_SMS,
  SEASONAL_UPDATE_METHOD,
  MOON_PHASE_TYPE,
  PROVINCE_LIST,
  PROVINCE_LIST_LOWERCASE,
  PROVINCE_LIST_ARCHIVE,
  NO_DATA_AVAILABLE,
  NO_DATA_AVAILABLE_VALUE,
  WIND_SIGNAL,
  WIND_SIGNAL_CODES
}
