import { Report } from './report'
import { ReportFirestore } from './report_firestore'
const REPORT = new Report()
const RF = new ReportFirestore()

export const createReport = REPORT.createReport.bind(REPORT)
export const createTendayReport = REPORT.createTendayReport.bind(REPORT)
export const createSpecialWeatherReport = REPORT.createSpecialWeatherReport.bind(REPORT)
export const deleteReport = REPORT.deleteReport.bind(REPORT)
export const previewBulletin = REPORT.previewBulletin.bind(REPORT)
export const previewBulletinTenday = REPORT.previewBulletinTenday.bind(REPORT)
export const previewBulletinSpecial = REPORT.previewBulletinSpecial.bind(REPORT)
export const getReport = RF.getReport.bind(RF)
export const getReports = RF.getReports.bind(RF)
