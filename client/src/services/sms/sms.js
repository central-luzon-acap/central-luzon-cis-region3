import axios from 'axios'
import RequestObject from '@/utils/requestobject'

const _SMS = {
  BASE_API_URL: process.env.BASE_API_URL,
  SEND_SMS_RECOMMENDATIONS: `${process.env.BASE_API_URL}/send`,
}

export class Sms extends RequestObject {
  async sendSMS(body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({
      ...obj,
      url: _SMS.SEND_SMS_RECOMMENDATIONS,
      method: 'POST',
    })

    return res.data
  }
}
