const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS } = require('../../utils/constants')

// This class manages the municipalities list references synced from the 10-day weather excel file and cropping calendar data
class Municipalities {
  /**
   * Create or update the global raw municipalities by provinces masterlist
   * @param {Object} jsonData - Output of ExcelFile.shapeJsonData()
   * @returns {Promise}
   */
  async upsertrawmunicipalities ({ metadata, data }) {
    return await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
      .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.REGION)
      .set({
        data,
        metadata: {
          ...metadata,
          date_created: admin.firestore.Timestamp.now()
        }
      })
  }

  /**
   * Create or update the formatted municipalities by provinces masterlist
   * This data is used for displaying data on drop-down menus on the client
   * @param {Object} jsonData - Output of ExcelFile.shapeJsonData()
   * @returns {Promise}
   */
  async upsertformattedmunicipalities ({ metadata, data }) {
    return await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
      .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.PROVINCES)
      .set({
        data,
        metadata: {
          ...metadata,
          date_created: admin.firestore.Timestamp.now()
        }
      })
  }

  /**
   * Create or update the ambigous/mismatching/missing municipality names from the 10-day weather forecast excel files and cropping calendar
   * @param {Object[]} data - Municipality names in { id, province, municipality, source } format
   * @returns
   */
  async upsertmunicipalitiesdiff (data) {
    return await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
      .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.DIFFS)
      .set({
        data,
        metadata: {
          title: 'Mismatching Municipality Names',
          description: 'List of municipality names that are present in the 10-day weather forecast excel files but missing in ACAPs cropping calendar, and vice-versa',
          source: 'PAGASA 10-day weather forecast excel files and ACAP cropping calendar',
          date_created: admin.firestore.Timestamp.now()
        }
      })
  }

  /**
   * Get the 10-day weather forecast and cropping-calendar synced municipality names
   * @returns {Object}
   */
  async getmunicipalitiesreference () {
    return await db.collection(FIRESTORE_COLLECTIONS.CONSTANT_STATIC_DATA)
      .doc(FIRESTORE_DOCUMENTS.CONSTANT_STATIC_DATA_DOCS.REGION)
      .get()
  }
}

module.exports = Municipalities
