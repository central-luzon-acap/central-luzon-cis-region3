const { isArray } = require('../utils/helpers')
const { isString, isNumber } = require('../scripts/pagasaexcel/utils/helpers')
const { FIRESTORE_DOCUMENTS, MOON_PHASE_TYPE } = require('../utils/constants')

const MAX_MOON_PHASES_STR = 15

// TO-DO: Use a validation library (joi)
module.exports.validRegionalTendayParams = async (req, res, next) => {
  const { data, region, type } = req.body
  let listTypeError = ''

  if (!region || !data || !type) {
    return res.status(500).send('Missing parameter/s')
  }

  if (!Object.values(FIRESTORE_DOCUMENTS.SEASONAL_TENDAY).includes(type)) {
    return res.status(500).send('Invalid update type param')
  }

  const maxStrLength = MAX_MOON_PHASES_STR

  try {
    if (!isArray(data)) {
      return res.status(500).send('Data list is not an array.')
    }

    if (type === FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES && data.length !== 4) {
      return res.status(500).send('Incorrect number of moon phases list.')
    }

    for (let i = 0; i < data.length; i += 1) {
      if (data[i].id === undefined || data[i].value === undefined) {
        listTypeError = 'Item is not an object or its missing ID and VALUE keys'
        break
      }

      if (!isNumber(data[i].id)) {
        listTypeError = 'ID is not a number'
        break
      }

      if (!isString(data[i].value)) {
        listTypeError = 'Item is not a string'
        break
      }

      if (data[i].value.length > maxStrLength) {
        listTypeError = 'Item exceeds max length'
        break
      }

      if (data[i].id !== i) {
        listTypeError = 'ID is not arranged in ascending order or there may be duplicate IDs'
        break
      }

      if (type === FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES) {
        if (data[i].phase === undefined) {
          listTypeError = 'Missing phase key'
          break
        }

        if (!isString(data[i].phase)) {
          listTypeError = 'Moon phase is not a string'
          break
        }

        if (!Object.values(MOON_PHASE_TYPE).includes(data[i].phase)) {
          listTypeError = 'Invalid moon phase type'
          break
        }
      }
    }

    if (listTypeError === '' && type === FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES) {
      const moonPhases = data.map(item => item.phase)
      if (!Object.values(MOON_PHASE_TYPE).every(phase => moonPhases.includes(phase))) {
        listTypeError = 'Missing a required moon phase field'
      }
    }

    if (listTypeError === '') {
      next()
    } else {
      return res.status(500).send(listTypeError)
    }
  } catch (err) {
    return next(new Error(err))
  }
}
