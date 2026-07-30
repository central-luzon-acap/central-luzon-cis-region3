const { getmunicipalitiesreference } = require('../../../classes/municipalities')

/**
 * Generates sample data similar to "./data.json" for the current provinces defined in the Firestore database.
 * The "data.code" is random, and may need to be adjusted later.
 * @returns {Object}
 */
const setDefaultProvincesInfo = async () => {
  let provinces

  try {
    // Get the latest province names reference
    const doc = await getmunicipalitiesreference()

    provinces = (doc.exists)
      ? Object.keys(doc.data().data)
      : null

    if (!provinces) {
      throw new Error('The province names reference is empty.\nPlease run the 03_forecast_10day or cron:tenday scripts first and try again.')
    }
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    return provinces.reduce((list, province) => {
      if (list[province] === undefined) {
        list[province] = {
          code: province.substring(0, 3).toUpperCase(),
          full: province
        }
      }

      return list
    }, {})
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = setDefaultProvincesInfo
