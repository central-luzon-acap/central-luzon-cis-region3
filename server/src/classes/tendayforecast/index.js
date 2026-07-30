const TendayForecast = require('./tendayforecast')
const TF = new TendayForecast()

/**
  * Create or update a 10-day weather forecast by province
  * @typedef {Object} param
  * @param {String} id - (Optional) Unique document identifier ID
  * @param {String} region - Region name
  * @param {String} province - Province name
  * @param {Object} municipalities - Contains municipality names as keys. Each "municipality" key contains an Object[] array of 10 items, containing 10-day weather forecast data for the municipality
  * @param {String} user - User uid
  * @returns {String} Firestore document reference
  */
const upsertforecast_tenday = TF.upsertforecast_tenday.bind(TF)

const getforecast = TF.getforecast.bind(TF)
const getforecastall = TF.getforecastall.bind(TF)
const getcurrentdayforecast = TF.getcurrentdayforecast.bind(TF)

/**
  * Generate a Firestore document ID under the this object's Firestore collection
  * @param {String} region Region name
  * @returns {String} Firestore document ID
  */
const createDocumentID = TF.createDocumentID.bind(TF)

module.exports = {
  TendayForecast,
  upsertforecast_tenday,
  getforecast,
  getforecastall,
  getcurrentdayforecast,
  createDocumentID
}
