import { CroppingCalendarRequest } from './cropping_calendar_request'

const CCR = new CroppingCalendarRequest()

export const upsertCroppingCalendar = CCR.upsertCroppingCalendar.bind(CCR)