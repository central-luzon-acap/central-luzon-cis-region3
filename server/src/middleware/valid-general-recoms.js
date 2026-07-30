const sanitycheck = require('../scripts/seeders/13_recommendations/lib/sanitycheck')

module.exports.validGeneralRecommendation = (req, res, next) => {
  const { type, recommendations, sms } = req.body
  const MAX_SMS_CHARS = 160
  const smsRegex = /^[a-zA-Z0-9\s,.!?()#@%*\-=]+$/

  try {
    if (!type) {
      return res.status(500).send('Missing parameter')
    }

    if (!recommendations && !sms) {
      return res.status(500).send('Missing at least one required parameter.')
    }

    // Note: recommendations HTML tags only expects the following tags:
    // ['ol', 'ul', 'li', 'span', 'p', 'strong', 'i', 'b', 'br']
    // TO-DO: To support a wider range of HTML tags, consider using other libraries for sanity checks
    if (recommendations && !sanitycheck(recommendations)) {
      throw new Error('HTML string contains unsupported tags')
    }

    if (sms) {
      if (sms.length > MAX_SMS_CHARS) {
        throw new Error(`SMS text is longer than ${MAX_SMS_CHARS} characters`)
      }

      if (!smsRegex.test(sms)) {
        throw new Error('Illegal character(s) in the SMS text')
      }
    }

    next()
    return
  } catch (err) {
    return next(err)
  }
}
