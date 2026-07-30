const { admin, db } = require('../../utils/db')
const {
  FIRESTORE_COLLECTIONS,
  FIRESTORE_DOCUMENTS
} = require('../../utils/constants')

// This class manages the global (common) regional seasonal weather forecast data common for all provinces
class RegionalSeasonal {
  /**
   * Create or update the global (common) regional seasonal weather forecast data
   * @param {String} region - Region name
   * @param {String} documentName - Firestore document name from FIRESTORE_COLLECTIONS.SEASONAL_REGIONAL options
   * @param {Object[]} data - Array of objects with a unique Number ID
   * @param {Object} user - Minimal Firebase Auth user information
   * @returns {Timestamp} Firestore timestamp of document update
   * @throws {Error} Async or validation error
   */
  async upsertseasonalregional ({ region, documentName, data, user }) {
    if (!Object.values(FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL).includes(documentName)) {
      throw new Error('Invalid common regional document name.')
    }

    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.SEASONAL_REGIONAL)
        .doc(documentName)
        .set({
          data,
          type: documentName,
          updated_by: user.email,
          uid: user.id,
          date_created: admin.firestore.Timestamp.now()
        })
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Get a regional (common) seasonal data Firestore document
   * @param {String} region - Region name
   * @param {String} documentName - Firestore document name from FIRESTORE_COLLECTIONS.SEASONAL_REGIONAL options
   * @returns {Object} Firestore document
   */
  async getseasonalregionaldoc ({ region, documentName }) {
    if (!Object.values(FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL).includes(documentName)) {
      throw new Error('Invalid common regional document name.')
    }

    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.SEASONAL_REGIONAL)
        .doc(documentName)
        .get()
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = RegionalSeasonal
