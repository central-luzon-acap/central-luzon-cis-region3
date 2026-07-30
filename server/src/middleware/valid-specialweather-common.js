const { isArray } = require('../utils/helpers')
const { isString, isNumber } = require('../scripts/pagasaexcel/utils/helpers')
const { FIRESTORE_DOCUMENTS } = require('../utils/constants')

const MAX_ITEMS_LENGTH = 50
const MAX_LABEL_STR_LENGTH = 30

module.exports.validSpecialWeatherParams = async (req, res, next) => {
  const { data, region, type } = req.body
  let listTypeError = ''

  if (!region || !data || !type) {
    return res.status(500).send('Missing parameter/s')
  }

  if (!Object.values(FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER).includes(type)) {
    return res.status(500).send('Invalid update type param')
  }

  try {
    if (!isArray(data)) {
      return res.status(500).send('No. of cyclones list is not an array.')
    }

    if (type === FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED &&
      (data.length > MAX_ITEMS_LENGTH)) {
      return res.status(500).send('Incorrect number of wind speed list.')
    }

    const counts = {}

    for (let i = 0; i < data.length; i += 1) {
      if (data[i].id === undefined || data[i].value === undefined || data[i].province === undefined || data[i].municipalities === undefined) {
        listTypeError = 'Item is not an object or its missing ID and VALUE keys'
        break
      }

      if (!isNumber(data[i].id)) {
        listTypeError = 'ID is not a number'
        break
      }

      if (!isString(data[i].province)) {
        listTypeError = 'Province is not a string'
        break
      }

      if (!isNumber(data[i].value)) {
        listTypeError = 'Wind speed is not a number'
        break
      }

      if (!isArray(data[i].municipalities)) {
        listTypeError = 'Municipalities is not an array'
        break
      }

      if (data[i].province.length > MAX_LABEL_STR_LENGTH) {
        listTypeError = 'Province exceeds max length'
        break
      }

      const province = data[i].province

      if (data[i].municipalities.filter(x => x.length > MAX_LABEL_STR_LENGTH) > 0) {
        listTypeError = 'One of municipalities exceeds max length'
        break
      }

      if (new Set(data[i].municipalities).size !== data[i].municipalities.length) {
        listTypeError = 'One of municipalities has a duplicate entry'
        break
      }

      if (req.REGION_LOCATIONS[province] === undefined) {
        listTypeError = `${province} is not a Bicol province.`
        break
      }

      if (data[i].id !== i) {
        listTypeError = 'ID is not arranged in ascending order or there may be duplicate IDs'
        break
      }

      if (data[i].municipalities.length > req.REGION_LOCATIONS[province].length ||
          data[i].municipalities.length === 0
      ) {
        listTypeError = `The number of ${province} municipalities is incorrect`
        break
      }

      if (!data[i].municipalities.every(municipality => req.REGION_LOCATIONS[province].includes(municipality))) {
        listTypeError = `Some municipalities do not belong to ${province}`
        break
      }

      if (counts[data[i].province] === undefined) {
        counts[data[i].province] = [i]
      } else {
        counts[data[i].province].push(i)
      }
    }

    // Check for duplicate province-municipality combos per wind signal group
    if (listTypeError === '') {
      for (const province in counts) {
        if (counts[province].length > 1) {
          for (let i = 0; i < counts[province].length; i += 1) {
            for (let j = i + 1; j < counts[province].length; j += 1) {
              const aIndex = counts[province][i]
              const bIndex = counts[province][j]

              if (data[aIndex].value === data[bIndex].value) {
                listTypeError = 'Duplicate provinces and wind signals are found.'
                break
              }

              if (data[aIndex].municipalities.some(x => data[bIndex].municipalities.indexOf(x) >= 0)) {
                listTypeError = 'Duplicate municipalities and wind signals are found.'
                break
              }
            }
          }
        }
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
