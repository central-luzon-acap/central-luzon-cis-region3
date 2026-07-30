const { getweathercondition } = require('../classes/seasonalforecast')
const { getmunicipalitiesreference } = require('../classes/municipalities')

const { isArray } = require('./helpers')

const {
  PROVINCES,
  WEATHER_CONDITIONS,
  SEASONAL_FORECAST_MONTHS
} = require('./constants')

const isInvalidProvinceAndMunicipality = async (province, municipality) => {
  const doc = await getmunicipalitiesreference()
  if (doc.exists) {
    const provinces = doc.data().data
    if (provinces[province] === undefined) {
      return {
        result: true,
        error: 'Submitted province does not exist for this region.'
      }
    } else if (!provinces[province].includes(municipality)) {
      return {
        result: true,
        error: `Submitted municipality does not belong to province: ${province}`
      }
    } else {
      return {
        result: false,
        error: ''
      }
    }
  } else {
    return {
      result: true,
      error: 'Something went wrong.'
    }
  }
}

/**
 * Check if the months array is valid
 * @param {Object[]} months
 */
const validSeasonalMonths = (months) => {
  // months should be an array
  if (!isArray(months)) {
    throw new Error('Months should be an array')
  }

  const mos = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
  ]

  // months should have (6) main entries
  if (months.length !== SEASONAL_FORECAST_MONTHS) {
    throw new Error('Incorrect no. of months')
  }

  // months should have defined constant labels
  let invalidMos = false
  for (let i = 0; i < months.length; i += 1) {
    if (!mos.includes(months[i].mo)) {
      invalidMos = true
      break
    }
  }

  if (invalidMos) {
    throw new Error('Invalid month labels.')
  }

  // months entries should have pre-defined keys
  let validEntries = true
  let validInnerValues = true

  // Should be arranged in alphabetically
  const validFields = {
    con: 'string',
    dry: 99,
    mean: 99,
    mo: 'string',
    normal: 99,
    val: 99,
    year: 99
  }

  const numberFields = Object.keys(validFields).filter(key => typeof validFields[key] === 'number')
  const vFields = Object.keys(validFields)

  for (let i = 0; i < months.length; i += 1) {
    const keys = Object.keys(months[i])
    keys.sort()

    // Each month should only have (3) keys (mo, val, con)
    if (keys.length !== vFields.length) {
      validEntries = false
      break
    }

    for (let j = 0; j < vFields.length; j += 1) {
      // Check for undefined/null in key-values
      if (months[i][keys[j]] === undefined || months[i][keys[j]] === null) {
        if (validEntries) {
          validEntries = false
          validInnerValues = false
        }
        break
      }

      // Check if key exists
      const includesKey = keys.includes(vFields[j])

      // Check if key-value type is valid
      const validKeyType =
        numberFields.includes(vFields[j])
          ? !isNaN(months[i][keys[j]])
          : typeof months[i][keys[j]] === typeof validFields[vFields[j]]

      // Check val, con values
      let validValue = true

      switch (keys[j]) {
        case 'val':
          validValue =
            parseInt(months[i][keys[j]]) >= 0 && months[i][keys[j]] <= 1000
          break
        case 'con':
          try {
            const weatherCondition = getweathercondition(months[i].val)

            validValue =
              WEATHER_CONDITIONS.includes(months[i].con) &&
              weatherCondition === months[i].con
          } catch (err) {
            throw new Error(err.message)
          }
          break
        default:
          break
      }

      if (!includesKey || !validKeyType || !validValue) {
        if (validEntries) {
          validEntries = false
          validInnerValues = false
        }
        break
      }
    }

    if (!validInnerValues) {
      break
    }
  }

  if (!validEntries) {
    throw new Error('Invalid values found in months.')
  }

  // TO-DO:
  // months should have a valid 'mo' sequence

  return true
}

const validSeasonalRegion = (region, provinces) => {
  // Provinces should be an array
  if (!isArray(provinces)) {
    throw new Error('Provinces should be an array.')
  }

  // Region name should be valid
  if (!PROVINCES[region]) {
    throw new Error('Invalid region name.')
  }

  // Provinces should not be greater than a region's number of provinces
  if (provinces.length === 0 || provinces.length > PROVINCES[region].length) {
    throw new Error('Invalid number of provinces.')
  }

  // Province names should have constant defined labels defined in a region's province list
  if (!provinces.every((item) => PROVINCES[region].includes(item.name))) {
    throw new Error('Invalid province name.')
  }

  try {
    for (let i = 0; i < provinces.length; i += 1) {
      validSeasonalMonths(provinces[i].months)
    }
  } catch (err) {
    throw new Error(err.message)
  }

  return true
}

const isInvalidCellnumber = (cellnumber) => {
  const SIMPLE_CELLNUMBER_PATTERN = /^09[0-9]{9}$/g
  return !cellnumber.match(SIMPLE_CELLNUMBER_PATTERN)
}

const alreadyInTheContactList = (contacts, cellnumber, docId) => {
  /**
   * The purpose of docId is to know if the request is a Create Contact
   * or an Edit Contact.
   *
   * If it's Edit Contact, there's a docId and that it's ok to pass
   * a cellnumber that is the same as the current cellnumber and
   * it will not give an error of existingContact assuming the
   * passed docId is the same as the contact being checked.
   *
   * The docId is used to identify if the passed cellnumber is the
   * same as the current cellnumber.
   *
   * If the passed docId is different from the contact's docId and
   * it's passing a cellnumber that's existing already in the
   * database, the validation kicks in.
   */

  const existingContact = contacts.find((contact) => {
    if (docId) return contact.cellnumber === cellnumber && contact.id !== docId
    else return contact.cellnumber === cellnumber
  })
  return Boolean(existingContact)
}

const isValidRecipients = (recipients) => {
  /**
   * This is to check each number if it's in the proper
   * pattern of a cell number.
   */
  let isValid = true
  recipients.forEach((recipient) => {
    if (isInvalidCellnumber(recipient)) {
      isValid = false
      return isValid
    }
  })

  return isValid
}

module.exports = {
  alreadyInTheContactList,
  isInvalidCellnumber,
  isValidRecipients,
  validSeasonalMonths,
  validSeasonalRegion,
  isInvalidProvinceAndMunicipality
}
