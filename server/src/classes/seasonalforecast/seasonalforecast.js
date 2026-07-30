const { admin, db } = require('../../utils/db')
const {
  FIRESTORE_COLLECTIONS,
  WEATHER_CONDITION_LABELS,
  NO_DATA_AVAILABLE_VALUE
} = require('../../utils/constants')

const { isNumber } = require('../../scripts/pagasaexcel/utils/helpers')

class SeasonalForecast {
  // Create or update a seasonal weather forecast by province
  async upsertforecast ({ region, province, months, user, update_method }) {
    const mos = months.map(x => x.mo)

    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.SEASONAL)
        .doc(province)
        .set({
          name: province,
          mos,
          months,
          update_method,
          updated_by: user.email,
          uid: user.id,
          date_created: admin.firestore.Timestamp.now()
        })
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }

  // Get the seasonal weather forecast of a region's province
  async getforecast ({ region, province }) {
    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.SEASONAL)
        .doc(province)
        .get()
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }

  // Get the seasonal weather forecast of a whole region
  async getforecastregion (region) {
    try {
      const docs = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.SEASONAL)
        .get()
        .then((snapshot) =>
          snapshot.docs.map((doc) =>
            doc.data()
          )
        )
      return docs
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Compute/set the seasonal weather condition based on value
   * With reference from PAGASA's seasonal forecast
   * https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast
   * @param {Number} value - Rainfall % value
   * @param {String} labelFormat - Seasonal weather condition label format to return (allowed values: seasonal, tenday, rainfall_amt)
   *  - seasonal: Returns the seasonal forecast rainfall condition text
   *  - tenday: Returns the 10-day forecast rainfall condition text
   *  - rainfall_amt: Returns the 10-day forecast rainfall amount descriptive text
   * @returns {String} Weather condition label in seasonal or 10-day weather forecast format, or the rainfall amt descriptive text
   */
  getweathercondition (value, labelFormat = 'seasonal') {
    const validLabels = ['seasonal', 'tenday', 'rainfall_amt']
    let condition = ''

    if (!isNumber(value)) {
      throw new Error(`${value} is not a number`)
    }

    const finalValue = Math.round(parseFloat(value))

    if (!validLabels.includes(labelFormat)) {
      throw new Error('Weather condition label format is not supported.')
    }

    let objectKey = ''

    switch (labelFormat) {
      case 'seasonal':
        objectKey = 'label'
        break
      case 'tenday':
        objectKey = 'tenday'
        break
      case 'rainfall_amt':
        objectKey = 'rainfall_amt_text'
        break
      default:
        break
    }

    // PAGASA rainfall amount legends and naming conventions

    if (finalValue <= 40) {
      condition = WEATHER_CONDITION_LABELS.WAY_BELOW_NORMAL[objectKey]
      // ACAP: 'drier'
    }

    if (finalValue >= 41 && finalValue <= 80) {
      condition = WEATHER_CONDITION_LABELS.BELOW_NORMAL[objectKey]
      // ACAP: 'normal'
      // ACAP: (41 >= value <= 120)
    }

    if (finalValue >= 81 && finalValue <= 120) {
      condition = WEATHER_CONDITION_LABELS.NEAR_NORMAL[objectKey]
      // ACAP: 'normal'
      // ACAP: (41 >= value <= 120)
    }

    if (finalValue > 120) {
      condition = WEATHER_CONDITION_LABELS.ABOVE_NORMAL[objectKey]
      // ACAP: 'wetter'
    }

    if (finalValue === NO_DATA_AVAILABLE_VALUE) {
      condition = WEATHER_CONDITION_LABELS.NO_DATA_AVAILABLE.label
    }

    return condition
  }
}

module.exports = SeasonalForecast
