const WEATHER_CONDITION_LABELS = {
  WAY_BELOW_NORMAL: {
    id: 0,
    label: 'wb_normal',
    label_acap: 'drier',
    sync: 'Way Below Normal',
    content: '<= 40%',
    tenday: 'NO RAIN',
  },
  BELOW_NORMAL: {
    id: 1,
    label: 'b_normal',
    label_acap: 'normal',
    sync: 'Below Normal',
    content: '41% - 80%',
    tenday: 'LIGHT RAINS',
  },
  NEAR_NORMAL: {
    id: 2,
    label: 'near_normal',
    label_acap: 'normal',
    sync: 'Near normal',
    content: '81% - 120%',
    tenday: 'MODERATE RAINS',
  },
  ABOVE_NORMAL: {
    id: 3,
    label: 'above_normal',
    label_acap: 'wetter',
    sync: 'Above Normal',
    content: '> 120%',
    tenday: 'HEAVY RAINS',
  },
  NO_DATA_AVAILABLE: {
    id: 4,
    label: 'nda',
    label_acap: 'nda',
    sync: 'No Data Available',
    content: 'nda',
    tenday: 'nda',
  },
}

const WEATHER_CONDITION_COLORS = {
  [WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label]: 'red',
  [WEATHER_CONDITION_LABELS.BELOW_NORMAL.label]: 'yellow',
  [WEATHER_CONDITION_LABELS.NEAR_NORMAL.label]: '#00c300',
  [WEATHER_CONDITION_LABELS.ABOVE_NORMAL.label]: 'blue',
  [WEATHER_CONDITION_LABELS.NO_DATA_AVAILABLE.label]: '#f2f2f2',
}

const MONTH_LABELS = {
  JAN: { code: 'jan', format: 'January', num: 0 },
  FEB: { code: 'feb', format: 'February', num: 1 },
  MAR: { code: 'mar', format: 'March', num: 2 },
  APR: { code: 'apr', format: 'April', num: 3 },
  MAY: { code: 'may', format: 'May', num: 4 },
  JUN: { code: 'jun', format: 'June', num: 5 },
  JUL: { code: 'jul', format: 'July', num: 6 },
  AUG: { code: 'aug', format: 'August', num: 7 },
  SEP: { code: 'sep', format: 'September', num: 8 },
  OCT: { code: 'oct', format: 'October', num: 9 },
  NOV: { code: 'nov', format: 'November', num: 10 },
  DEC: { code: 'dec', format: 'December', num: 11 },
}

const CROP_STAGES = {
  PREP: 'Land Preparation',
  PLANT: 'Planting',
  GROW: 'Growing',
  HARV: 'Harvesting',
}

const CROP_STAGE_LABELS_V2 = {
  Rice: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage',
    plant: 'Newly Planted',
    vegat: 'Vegetative (Active Tillering)',
    vegpi: 'Reproductive (Panicle Initiation)',
    repro: 'Reproductive (Flowering)',
    mat: 'Maturing',
  },
  Corn: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage',
    vegleaf: 'Vegetative (Leaf Stages)',
    vegtass: 'Vegetative (Tasseling)',
    repro: 'Reproductive',
    mat: 'Maturing',
  },
  Cassava: {
    prep: 'Preparation Stage',
    est: 'Crop Establishment Stage',
    vegcc: 'Vegetative (Canopy Closure)',
    vegtb: 'Vegetative (Tuber Bulking)',
    mat: 'Maturing',
  },
  PoleSitao: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage (Emergence)',
    est: 'Crop Establishment Stage',
    vegfi: 'Vegetative (Flower Initiation)',
    vegpf: 'Reproductive (Pod Formation)',
    mat: 'Maturing',
  },
  Ampalaya: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage (Emergence)',
    est: 'Crop Establishment Stage',
    vegfi: 'Vegetative (Flower Initiation)',
    repff: 'Reproductive (Flower and Fruit Formation)',
    mat: 'Maturing',
  },
   Tomato: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage',
    plant: 'Newly Planted',
    vegat: 'Vegetative (Active Tillering)',
    vegpi: 'Reproductive (Panicle Initiation)',
    repro: 'Reproductive (Flowering)',
    mat: 'Maturing',
  },
   Cucumber: {
    prep: 'Preparation Stage',
    seed: 'Seedling Stage',
    plant: 'Newly Planted',
    vegat: 'Vegetative (Active Tillering)',
    vegpi: 'Reproductive (Panicle Initiation)',
    repro: 'Reproductive (Flowering)',
    mat: 'Maturing',
  }

  // To Add more crop stages for the remaining 3
}

const CLIMATE_RISKS = {
  no_risk: 'No Risk',
  flood_submergence: 'Flood Submergence',
  flood_submergence_risk: 'Flood Submergence',
  flooding_submergence_3m: 'Flooding Submergence',
  flooding_submergence_2h: 'Flooding Submergence',
  dry_condition: 'Dry Condition',
  dry_spell: 'Dry Spell',
  dry_spell_2WB: 'Dry Spell',
  dry_spell_3B: 'Dry Spell',
  drought_3WB: 'Drought',
  drought_5B: 'Drought',
  drought: 'Drought',
  wet_condition: 'Wet Condition',
  wet_spell: 'Wet Spell',
  water_shortage_risk: 'Water Shortage Risk',
  water_shortage_risk_5n: 'Water Shortage Risk',
  water_shortage_risk_10l: 'Water Shortage Risk',
}

const WIND_SIGNAL = {
  general_no_signal: 'General (No Signal)',
  signal_number_1: 'Signal No. 1',
  signal_number_2: 'Signal No. 2',
  signal_number_3: 'Signal No. 3',
  signal_number_4: 'Signal No. 4',
  signal_number_5: 'Signal No. 5',
}

const WIND_SIGNAL_CODES = {
  SIGNAL_0: 'general_no_signal',
  SIGNAL_1: 'signal_number_1',
  SIGNAL_2: 'signal_number_2',
  SIGNAL_3: 'signal_number_3',
  SIGNAL_4: 'signal_number_4',
  SIGNAL_5: 'signal_number_5',
}

const CROP_STAGE_CODES = Object.keys(CROP_STAGES).map((item) =>
  item.toLowerCase(),
)

const CROP_STAGES_MONTH = {
  FIRST_HALF: '1st_half', // Day 1-15 of a month
  SECOND_HALF: '2nd_half', // Day 16 to last day of a month
}

const ACCOUNT_LEVEL = {
  SUPERADMIN: 1,
  ADMIN: 2,
}

const PDF_BULLETINS = {
  // Crop Recommendations Bulletins (logs)
  PDF_CROPS: 'bulletins_pdf_crops',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_TENDAY: 'bulletins_pdf_tenday',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_SPECIAL: 'bulletins_pdf_special',

  // Firebase Storage bucket for 10-day bulletin PDFs
  PDF_STORAGE_TENDAY: 'bulletins_tenday',

  // Firebase Storage bucket for 10-day bulletin PDFs
  PDF_STORAGE_SPECIAL: 'bulletins_special',

  // Firebase Storage bucket for seasonal bulletin PDFs
  PDF_STORAGE_SEASONAL: 'bulletins',
}

// Seasonal weather forecast data manner of update
const SEASONAL_UPDATE_METHOD = {
  // Update method is from an excel file upload
  EXCEL: 'excel',
  // Update method is from manual input
  ENCODE: 'encode',
}

const MESSAGE_TYPE = { SUCCESS: 'success', ERROR: 'error', INFO: 'info' }

const REGION_CODE = process.env.REGION_CODE.replace('_', ' ')

const splitted = process.env.REGION_NAME.split('_')
let _regionName = ''
splitted.forEach((item, index) => {
  _regionName = _regionName.concat(item.charAt(0).toUpperCase() + item.slice(1))
  if (index !== splitted.length - 1) _regionName = _regionName.concat(' ')
})
const REGION_NAME = _regionName
const HARD_CODED_SMS = `[This is a test run. Do not reply.] Recommendations from the ACAP-${REGION_NAME.toUpperCase()} will be sent thru SMS using this account. For validation and confirmation of receipt, kindly send YES to 09173037830. Thank you and keep safe!`

const REGIONAL_FIELD_OFFICE = process.env.REGIONAL_FIELD_OFFICE
const REGION_URL = process.env.REGION_URL
const REGION_LAT_AND_LNG = process.env.REGION_LAT_AND_LNG
const NO_DATA_AVAILABLE = 'nda'
const NO_DATA_AVAILABLE_VALUE = null

export {
  WEATHER_CONDITION_LABELS,
  MONTH_LABELS,
  WEATHER_CONDITION_COLORS,
  CROP_STAGES,
  CROP_STAGE_LABELS_V2,
  CROP_STAGES_MONTH,
  CROP_STAGE_CODES,
  ACCOUNT_LEVEL,
  PDF_BULLETINS,
  HARD_CODED_SMS,
  SEASONAL_UPDATE_METHOD,
  MESSAGE_TYPE,
  REGION_CODE,
  REGION_NAME,
  REGION_LAT_AND_LNG,
  REGIONAL_FIELD_OFFICE,
  REGION_URL,
  NO_DATA_AVAILABLE,
  NO_DATA_AVAILABLE_VALUE,
  CLIMATE_RISKS,
  WIND_SIGNAL,
  WIND_SIGNAL_CODES,
}
