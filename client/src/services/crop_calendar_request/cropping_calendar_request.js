import axios from 'axios'
import RequestObject from '@/utils/requestobject'

export class CroppingCalendarRequest extends RequestObject {
  async upsertCroppingCalendar (body, cropName) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: `${process.env.BASE_API_URL}/uploadCroppingCalendar/${cropName}`, method: 'POST' })
    return res.data
  }
}