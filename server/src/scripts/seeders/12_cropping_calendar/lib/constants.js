const CROP_STAGE_LABELS = {
  'plant/trans': 'Newly Planted',
  'veg/repro': 'Vegetative/Reproductive',
  mat: 'Maturing',
  lprep: 'Preparation Stage'
}

const CROP_STAGE_LABELS_V2 = {
  Rice: {
    'Preparation Stage': 'prep',
    'Seedling Stage': 'seed',
    'Newly Planted': 'plant',
    'Vegetative (Active Tillering)': 'vegat',
    'Reproductive (Panicle Initiation)': 'vegpi',
    'Reproductive (Flowering)': 'repro',
    Maturing: 'mat'
  },
  Corn: {
    'Preparation Stage': 'prep',
    'Seedling Stage': 'seed',
    'Vegetative (Leaf Stages)': 'vegleaf',
    'Vegetative (Tasseling)': 'vegtass',
    Reproductive: 'repro',
    Maturing: 'mat'
  },
  Cassava: {
    'Preparation Stage': 'prep',
    'Crop Establishment Stage': 'est',
    'Vegetative (Canopy Closure)': 'vegcc',
    'Vegetative (Tuber Bulking)': 'vegtb',
    Maturing: 'mat'
  },
  PoleSitao: {
    'Preparation Stage': 'prep',
    'Seedling Stage (Emergence)': 'seed',
    'Crop Establishment Stage': 'est',
    'Vegetative (Flower Initiation)': 'vegfi',
    'Reproductive (Pod Formation)': 'vegpf',
    Maturing: 'mat'
  },
  Ampalaya: {
    'Preparation Stage': 'prep',
    'Seedling Stage (Emergence)': 'seed',
    'Crop Establishment Stage': 'est',
    'Vegetative (Flower Initiation)': 'vegfi',
    'Reproductive (Flower and Fruit Formation)': 'repff',
    Maturing: 'mat'
  },
  Tomato: {
    'Preparation Stage': 'prep',
    'Seedling Stage': 'seed',
    'Newly Planted': 'plant',
    'Vegetative (Active Tillering)': 'vegat',
    'Reproductive (Panicle Initiation)': 'vegpi',
    'Reproductive (Flowering)': 'repro',
    Maturing: 'mat'
  },
  Cucumber: {
    'Preparation Stage': 'prep',
    'Seedling Stage': 'seed',
    'Newly Planted': 'plant',
    'Vegetative (Active Tillering)': 'vegat',
    'Reproductive (Panicle Initiation)': 'vegpi',
    'Reproductive (Flowering)': 'repro',
    Maturing: 'mat'
  }

  // To Add more crop stages for the remaining 3
}

// Uncommon cropping calendar municipality names detected from /missing_municipalities
// Replace the following with municipality names from the 10-day weather forecast file
const MUNICIPALITIES_TO_REPLACE_WITH_PAGASA = [
  { province: 'Albay', municipality: 'Sto.Domingo', replace: 'Santo Domingo' },
  { province: 'Albay', municipality: 'Pioduran', replace: 'Pio Duran' },
  { province: 'Camarines Norte', municipality: 'Sta. Elena', replace: 'Santa Elena' },
  { province: 'Camarines Norte', municipality: 'SL Ruiz', replace: 'San Lorenzo Ruiz' },
  { province: 'Camarines Sur', municipality: 'Sangay', replace: 'Sagnay' },
  { province: 'Sorsogon', municipality: 'Pto. Diaz', replace: 'Prieto Diaz' },
  { province: 'Sorsogon', municipality: 'Sta. Magdalena', replace: 'Santa Magdalena' }
]

const DATA_TYPE = {
  CALENDAR: 'calendar',
  FORECAST: '10_day_forecast'
}

module.exports = {
  CROP_STAGE_LABELS,
  CROP_STAGE_LABELS_V2,
  DATA_TYPE,
  MUNICIPALITIES_TO_REPLACE_WITH_PAGASA
}
