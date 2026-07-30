import { CropCalendar } from './crop_calendar'

const CC = new CropCalendar()

export const getCroppingCalendarMunicipality = CC.getCroppingCalendarMunicipality.bind(CC)
export const getCroppingCalendarProvince = CC.getCroppingCalendarProvince.bind(CC)
export const getCroppingCalendarV2Province = CC.getCroppingCalendarV2Province.bind(CC)
export const getCropStages = CC.getCropStages.bind(CC)
export const getCropList = CC.getCropList.bind(CC)

