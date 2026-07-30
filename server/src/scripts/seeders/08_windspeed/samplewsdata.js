require('dotenv').config()
const { getmunicipalities } = require('../../../classes/provinces')

/**
 * Create a wind speed document entry for the
 * FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED collection
 * @param {String} province - Province name
 * @returns {Object[]}
 */
const sampleWindspeedData = async (province) => {
  try {
    const municipalities = await getmunicipalities(province, 3)

    return [{
      id: 0,
      province,
      signal: 1,
      value: 1,
      municipalities
    }]
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = sampleWindspeedData
