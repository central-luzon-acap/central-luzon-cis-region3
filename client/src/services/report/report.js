import axios from 'axios'
import RequestObject from '../../utils/requestobject'

export const _Report = {
  BASE_API_URL: process.env.BASE_API_URL,
  CREATE_REPORT: `${process.env.BASE_API_URL}/reports/seasonal/crops`,
  CREATE_REPORT_TENDAY: `${process.env.BASE_API_URL}/reports/tenday/crops`,
  CREATE_REPORT_SPECIAL: `${process.env.BASE_API_URL}/reports/special/crops`,
  REPORTS_CROPS: 'reports_crops'
}

export class Report extends RequestObject {
  async createReport (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT, method: 'POST' })
    return res.data
  }

  async createTendayReport (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT_TENDAY, method: 'POST' })
    return res.data
  }

  async createSpecialWeatherReport (body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT_SPECIAL, method: 'POST' })
    return res.data
  }

  async deleteReport (docId) {
    const body = { docId }
    const obj = await this.createRequestObject({ body })
    return await axios({ ...obj, url: _Report.CREATE_REPORT, method: 'DELETE' })
  }

  async previewBulletin (body) {
    const obj = await this.createRequestObject({ body, responseType: 'blob' })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT, method: 'POST' })
    return res.data
  }

  async previewBulletinTenday (body) {
    const obj = await this.createRequestObject({ body, responseType: 'blob' })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT_TENDAY, method: 'POST' })
    return res.data
  }

  async previewBulletinSpecial (body) {
    const obj = await this.createRequestObject({ body, responseType: 'blob' })
    const res = await axios({ ...obj, url: _Report.CREATE_REPORT_SPECIAL, method: 'POST' })
    return res.data
  }
}
