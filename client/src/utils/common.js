import {
  WEATHER_CONDITION_LABELS,
  NO_DATA_AVAILABLE,
  NO_DATA_AVAILABLE_VALUE
} from './constants'

// Convert PAGASA's weather condition naming convention with ACAP's current 3-naming convention
// as listed on CSV and saved in DB
const pagasaToACAPLegends = (pagasaName) => {
  let converted = ''
  switch (pagasaName) {
    case WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL.label:
      converted = 'drier'
    break
    case WEATHER_CONDITION_LABELS.BELOW_NORMAL.label:
    case WEATHER_CONDITION_LABELS.NEAR_NORMAL.label:
      converted = 'normal'
      break
    case WEATHER_CONDITION_LABELS.ABOVE_NORMAL.label:
      converted = 'wetter'
      break
    default:
      break
  }

  return converted
}

/**
 * Rounds off long decimal values to at most (1) decimal place if its longer than (2) decimal places
 * @param {Number} value - Whole or decimal number value
 * @param {Number} decimalPlaces - Number of decimal places
 * @returns {String} formatted Number with constant (1) decimal place
 */
const roundOff = (value, decimalPlaces = 1) => {
  return parseFloat(value).toFixed(decimalPlaces)
}

/**
 * Formats a Number input to a fixed 1-decimal place string, or an "nda" string if its null.
 * @param {Number} value - Whole or decimal number value
 * @returns {String}
 */
const displayNdaOrValue = (value) => {
  return (value === NO_DATA_AVAILABLE_VALUE)
    ? NO_DATA_AVAILABLE
    : roundOff(value)
}

/**
 * Parses detailed error message from a request with a Blob response type
 * @param {Error} errorResponse - Error response object from a request with a Blob response type
 * @returns {String} - Error response
 */
const parseBlobErrorResponse = (errorResponse = undefined) => {
  return new Promise((resolve) => {
    if (errorResponse === undefined || typeof errorResponse !== 'object') {
      resolve('Missing error response object')
    } else {
      let errMessage = ''

      if (errorResponse.response) {
        // Read the detailed server error from the Blob error response (Blob responseType sent in axios)
        const isBlob = errorResponse.response.data instanceof Blob

        if (isBlob) {
          const blob = new Blob([errorResponse.response.data], { type: 'application/octet-stream' })
          const reader = new FileReader()

          reader.onload = () => {
            const blobErrorResponse = reader.result
            resolve(blobErrorResponse)
          }

          reader.readAsText(blob)
        } else {
          resolve('Error reading data')
        }
      } else if (errorResponse.request) {
        // The request was made but no response was received
        errMessage = errorResponse.request
        resolve(errMessage)
      } else {
        // Something happened in setting up the request that triggered an Error
        errMessage = errorResponse.message
        resolve(errMessage)
      }
    }
  })
}

export {
  pagasaToACAPLegends,
  displayNdaOrValue,
  parseBlobErrorResponse,
  roundOff
}
