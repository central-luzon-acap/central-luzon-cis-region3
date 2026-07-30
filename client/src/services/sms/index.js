import { Sms } from './sms'

const SMS = new Sms()

export const sendSMS = SMS.sendSMS.bind(SMS)
