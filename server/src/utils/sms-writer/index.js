const {
  SMS_SEASONAL,
  SMS_TENDAY,
  SMS_SPECIAL,
  SMS_TYPE,
  REPLACE_KEYS,
  SMS_PLACEHOLDERS_V2
} = require('./templates')

/**
 * Build the SMS text content from a set of templates and input
 * @typedef {Object} params - Input parameters
 * @param {String} params.type - Weather forecast type. One of `SMS_TYPE` (seasonal, tenday, special). Not required if `params.text` has a value
 * @param {Object} params.replacements - key-value pairs for replacement on the local template or provided `params.text`
 *    - keys correspond to the double-parenthesis `{{key}}` items in the template or `params.text`
 *    - When using the local file templates, be sure to check out the expected keys under `REPLACE_KEYS` for a specific `params.type`
 * @param {String} params.text - (Optional) SMS text template. This should contain keys to replace in double curly braces i.e., `{{replace_me}}`

 *    -
 * @param {String} type - SMS type (SMS_TYPE)
 */
const smsWriter = ({ type, replacements, text }) => {
  let smsText = text ?? ''

  if (type && !Object.values(SMS_TYPE).includes(type)) {
    throw new Error('Invalid SMS type')
  }

  if (!text) {
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
  SMS_PLACEHOLDERS_V2
}
