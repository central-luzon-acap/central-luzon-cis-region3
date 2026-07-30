import { Region } from './region'

const REGION = new Region()

export const getProvinces = REGION.getProvinces.bind(REGION)
export const getVillages = REGION.getVillages.bind(REGION)
export const getProvincesMunicipalities = REGION.getProvincesMunicipalities.bind(REGION)
export const getRegion = REGION.getRegion.bind(REGION)
