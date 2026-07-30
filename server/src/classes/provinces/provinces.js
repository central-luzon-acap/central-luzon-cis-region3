const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS } = require('../../utils/constants')

// This class manages miscellaneous and other information of ACAP's supported provinces
class Provinces {
  /**
   * Create or update provinces information
   * @param {Object[]} data - Each object contains information about a province i.e., { id, code, full }, etc.
   * @returns
   */
  async upsertprovincesinfo (data) {
    return await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
      .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.PROVINCES_INFO)
      .set({
        data,
        metadata: {
          title: 'Province Information',
          description: 'Other miscellaneous information about supported provinces',
          date_created: admin.firestore.Timestamp.now()
        }
      })
  }

  /**
   * Firestore document containing all provinces information
   * @returns {Object} { data: array, metadata: Object }
   */
  async getprovincesinfo () {
    try {
      const doc = await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
        .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.PROVINCES_INFO)
        .get()

      return (doc.exists)
        ? doc.data()
        : null
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Get the list of municipalities under a province.
   * @param {String} province - Province name
   * @param {Number} limit - Number of municipalities to return. Returns all, if ommitted.
   * @returns {String[]} List of municipalities under a province.
   */
  async getmunicipalities (province, limit) {
    try {
      const doc = await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
        .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.REGION)
        .get()

      if (doc.exists) {
        const provinceData = doc.data().data[province]

        if (!provinceData) {
          return []
        }

        return (limit !== undefined)
          ? provinceData.slice(0, limit)
          : provinceData
      }

      return []
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = Provinces
