const {
  SMS_SEASONAL,
  SMS_TENDAY,
  SMS_SPECIAL,
  SMS_TYPE,
  REPLACE_KEYS,
  MONTHS_TAGALOG
} = require('./templates')

/**
 * Build the SMS text content from a set of templates and input
 * @param {Object} replacements - key-value pairs for replacement on the template
 *    - keys correspond to the double-parenthesis {{key}} items in the template
 *    -
 * @param {String} type - SMS type (SMS_TYPE)
 */
const smsWriter = ({ type, replacements }) => {
  let smsText = ''

  if (!Object.values(SMS_TYPE).includes(type)) {
    throw new Error('Invalid SMS type')
  }

  switch (type) {
    case SMS_TYPE.SEASONAL:
      smsText = SMS_SEASONAL
      break
    case SMS_TYPE.TENDAY:
      smsText = SMS_TENDAY
      break
    case SMS_TYPE.SPECIAL:
      smsText = SMS_SPECIAL
      break
    default:
      break
  }

  for (const key in replacements) {
    smsText = smsText.replace(`{{${key}}}`, replacements[key])
  }

  return smsText
}

module.exports = {
  smsWriter,
  SMS_TYPE,
  REPLACE_KEYS,
  MONTHS_TAGALOG
}
