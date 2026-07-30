const { isArray } = require('../utils/helpers')
const { isString, isNumber } = require('../scripts/pagasaexcel/utils/helpers')
const { FIRESTORE_DOCUMENTS } = require('../utils/constants')

const MAX_MISC_WEATHER_ITEMS = 25
const MAX_MISC_WEATHER_STR = 30
const MAX_CYCLONES_STR = 15
const CYCLONES_LIST_LENGTH = 6
const NO_DATA_AVAILABLE = 'nda'

/**
 * Checks for valid tropical cyclones input values
 * @param {String} stringValue - Input parameter for a tropical cyclone item
 *  - a. Single number between (0-10) = ex: "1"
 *  - b. Two numbers with "or" between = ex: "1 or 2"
 *  - c. No Data Available = ex: "nda"
 * @returns {Bool}
 */
const isValidTropicalCycloneValue = (stringValue) => {
  const validCycloneSignals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => x.toString())
  const singleSignalNum = validCycloneSignals.includes(stringValue) // ex: "1"
  const validSignalWithOr = /^([0-9]|10) or ([0-9]|10)$/g.test(stringValue) // ex: "1 or 2"

  return ((validSignalWithOr || singleSignalNum) || stringValue === NO_DATA_AVAILABLE)
}

module.exports.validRegionalSeasonalParams = async (req, res, next) => {
  const { data, region, type } = req.body
  let listTypeError = ''

  if (!region || !data || !type) {
    return res.status(500).send('Missing parameter/s')
  }

  if (!Object.values(FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL).includes(type)) {
    return res.status(500).send('Invalid update type param')
  }

  const maxStrLength = (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT)
    ? MAX_CYCLONES_STR
    : MAX_MISC_WEATHER_STR

  try {
    if (!isArray(data)) {
      return res.status(500).send('No. of cyclones list is not an array.')
    }

    if (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT && data.length !== CYCLONES_LIST_LENGTH) {
      return res.status(500).send('Incorrect number of cyclones list.')
    }

    if (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.MISC_WEATHER_SYSTEMS &&
      (data.length > MAX_MISC_WEATHER_ITEMS || data.length === 0)) {
      return res.status(500).send('Incorrect number of weather systems list.')
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

      if (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT) {
        if (!isValidTropicalCycloneValue(data[i].value)) {
          listTypeError = 'Invalid tropical cyclone count value.'
          break
        }
      }

      if (data[i].value.length > maxStrLength) {
        listTypeError = 'Item exceeds max length'
        break
      }

      if (data[i].id !== i) {
        listTypeError = 'ID is not arranged in ascending order or there may be duplicate IDs'
        break
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
