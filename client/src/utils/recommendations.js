import { CROP_STAGE_LABELS_V2, CLIMATE_RISKS, WIND_SIGNAL } from '@/utils/constants'

const changeCodeToLabel = (field, value, cropType) => {
  switch (field) {
    case 'crop_stage':
      return CROP_STAGE_LABELS_V2[cropType][value]
    case 'climate_risk':
      return CLIMATE_RISKS[value]
    case 'wind_signal':
      return WIND_SIGNAL[value]
    default:
      return value
  }
}

export { changeCodeToLabel }
