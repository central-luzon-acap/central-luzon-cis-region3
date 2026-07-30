/**
 * Rounds off long decimal values to at most (1) decimal place if its longer than (2) decimal places
 * @param {Number} value - Whole or decimal number value
 * @param {Number} decimalPlaces - Number of decimal places
 * @returns {String} formatted Number with max (1) decimal place
 */
const roundOff = (value, decimalPlaces = 1) => {
  return parseFloat(value).toFixed(decimalPlaces)
}

/**
 * Replaces the value input parameter with a "raplacementStr" if its null
 * @param {(Any)} value - Any of the javascript primitive data type
 * @param {String} replacementStr - String to replace the null value
 * @returns
 */
const nullToString = (value, replacementStr = 'nda') => {
  return (value === null)
    ? replacementStr
    : roundOff(value)
}

module.exports = {
  nullToString,
  roundOff
}
