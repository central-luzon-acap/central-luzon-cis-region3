const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, REPORT_TYPE } = require('../../utils/constants')

// Bulletin Firestore documents and PDF file handler
class Bulletin {
  /**
   * Get the Firestore collection name of a collection containing the Bulletin object
   * @param {String} type - Bulletin type. One of  REPORT_TYPE
   * @returns {String} Firestore collection name of a collection containing the Bulletin object
   */
  getDocumentCollectionName (type) {
    let collection

    switch (type) {
      case REPORT_TYPE.SEASONAL:
        collection = FIRESTORE_COLLECTIONS.PDF_CROPS
        break
      case REPORT_TYPE.TEN_DAY:
        collection = FIRESTORE_COLLECTIONS.PDF_CROPS_TENDAY
        break
      case REPORT_TYPE.SPECIAL:
        collection = FIRESTORE_COLLECTIONS.PDF_CROPS_SPECIAL
        break
    }

    return collection
  }

  /**
   * Get the Firebase Storage folder name of the PDF file associated with a Bulletin object
   * @param {String} type - Bulletin type. One of  REPORT_TYPE
   * @returns {String} Firebase Storage folder name
   */
  getPDFStorageFolderName (type) {
    let collection

    switch (type) {
      case REPORT_TYPE.SEASONAL:
        collection = FIRESTORE_COLLECTIONS.PDF_STORAGE_SEASONAL
        break
      case REPORT_TYPE.TEN_DAY:
        collection = FIRESTORE_COLLECTIONS.PDF_STORAGE_TENDAY
        break
      case REPORT_TYPE.SPECIAL:
        collection = FIRESTORE_COLLECTIONS.PDF_STORAGE_SPECIAL
        break
    }

    return collection
  }

  /**
   * Build and return the Bulletin Firestore document name from the filename
   * @param {String} filename - PDF filename
   * @returns {String} Bulletin Firestore document name
   */
  getDocumentNameFromFilename (filename) {
    return filename.toLowerCase().substring(0, filename.length - 4)
  }

  /**
   * Create a Bulletin Firestore document
   * @param {String} region - Region name
   * @param {String} province - Province name
   * @param {String} municipality - Municipality name
   * @param {String} filename - Full bulletin PDF file name
   * @param {String} reportId - Firestore document ID of the Report that triggered the creation of this Bulletin
   * @param {Object} user - Signed-in admin's user information
   * @param {String} tyoe - Bulletin type. One of  REPORT_TYPE
   * @returns {Promise} Firestore document creation logs async Promise
   */
  async createbulletin ({ region, province, municipality, crop, filename, reportId = '', user, type = REPORT_TYPE.SEASONAL }) {
    const id = db.collection(FIRESTORE_COLLECTIONS.PDF_CROPS).doc().id
    const idstr = filename.replace(/ /g, '_').toLowerCase().substring(0, filename.length - 4)
    const path = this.getDocumentCollectionName(type)

    return await db.collection(path)
      .doc(idstr)
      .set({
        id,
        reportId,
        idstr,
        region,
        province,
        crop,
        filename,
        uid: user.uid,
        type,
        scope: FIRESTORE_COLLECTIONS.SEASONAL,
        date_created: admin.firestore.Timestamp.now()
      })
  }

  /**
   * Get a Bulletin Firestore document
   * @param {String} type - Bulletin type. One of  REPORT_TYPE
   * @param {String} docname - Firestore document
   * @returns {Object} Bulletin Firestore document
   */
  async getbulletin ({ type, docname }) {
    const collectionName = this.getDocumentCollectionName(type)
    return await db.collection(collectionName).doc(docname).get()
  }

  /**
   * Deletes a Bulletin Firestore document
   * @param {String} type - Bulletin type. One of  REPORT_TYPE
   * @param {String} docname - Firestore document
   * @returns {Promise} Firestore document deletion async Promise
   */
  async deletebulletin ({ type, docname }) {
    const doc = await this.getbulletin({ type, docname })

    if (doc.exists) {
      const path = this.getDocumentCollectionName(type)
      return await db.collection(path).doc(docname).delete()
    }

    throw new Error(`Bulletin ${docname} does not exist`)
  }
}

module.exports = Bulletin
