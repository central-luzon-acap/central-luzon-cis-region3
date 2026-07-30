const { WEATHER_CONDITION_LABELS } = require('./constants')

/**
 * Check if paramater is an Array
 * @param {Array} array
 * @returns {Bool} true | false
 */
const isArray = (array) => {
  return typeof array === 'object' && array.length !== undefined
}

/**
 * Simulate a delay before proceeding to other processs
 * @param {Number} seconds - Seconds to delay
 * @param {Bool} log - Flag to log the number of seconds that passed
 * @returns {Promise} Returns a fullfilled Promise as flag that the delay is finished
 */
const waitForDelay = (seconds = 1, log = false) => new Promise((resolve) => {
  let t = 0

  const i = setInterval(() => {
    if (log) {
      console.log(`time: ${t}`)
    }

    if (t >= seconds - 1) {
      clearInterval(i)

      if (log) {
        console.log('proceed')
      }

      resolve('proceed')
    }
    t += 1
  }, 1000)
})

/**
 * Splits an array of Numbers into arrays of max 10-unique Number elements.
 * Targeted for splitting Firestore "where('id', 'in' array)" queries into groups of 10 by a Number "id" field.
 * @param {Number[]} numbers
 * @returns {Array[][]} Array of Numbers grouped into Arrays of max 10 unique Numbers
 */
const groupsOfTen = (numbers) => {
  let groups = []
  let temp = []

  // Filter unique numbers
  const unique = numbers.filter((x, i, a) => a.indexOf(x) === i)

  for (let i = 0; i < unique.length; i += 1) {
    temp.push(unique[i])

    if ((temp.length) % 10 === 0) {
      groups = [...groups, temp]
      temp = []
    }
  }

  if (temp.length > 0 && groups.length > 0) {
    return [...groups, temp]
  }

  if (temp.length === 0 && groups.length > 0) {
    return groups
  }

  if (temp.length > 0 && groups.length === 0) {
    return [temp]
  }
}

/**
 * Group an array of document ID's into unique-element/item groups (arrays) of 10's.
 * @param {String[]} docIds
 * @returns {String[]} String Array containing Arrays with max 10 elements each.
 */
const groupByTens = (docIds) =>
  [...new Set(docIds)].reduce((list, item) => {
    const subgroups = list.length - 1

    if (list[subgroups].length < 10) {
      list[subgroups].push(item)
    } else {
      list.push([item])
    }

    return list
  }, [[]])

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

module.exports = {
  isArray,
  waitForDelay,
  groupsOfTen,
  groupByTens,
  pagasaToACAPLegends
}
