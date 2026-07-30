const { admin, db } = require('../../utils/db')
const { dayjsUTC } = require('../../utils/dayjs_utc')

const {
  LOG_COLLECTION,
  LOG_LEVELS,
  LOG_OBJECTS,
  LOG_CATEGORIES,
  LOG_OBJ_TYPE
} = require('./constants')

/**
 * Manages error logging to the Firestore DB.
 * Superclass of the ErrorDoc and ErrorItem sub-classes.
 */
class ErrorLog {
  // Date timezone
  timezone = 'Singapore'

  // Date string format
  dateStrFormat = 'YYYY/MM/DD'

  async createLog () {
    // Override this function
  }

  /**
   * Deletes a single ErrorLog document by ID (document name)
   * @typedef {Object} params - Input parameters
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   * @param {String} docId - Firestore document ID
   * @returns {Promise}
   */
  async deleteLogById ({ type, category, docId }) {
    return await db
      .collection(LOG_COLLECTION)
      .doc(type)
      .collection(category)
      .doc(docId)
      .delete()
  }

  /**
   * Retrieves a list of Error logs by type and category
   * @typedef {Object} params - Input parameters
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   * @param {String} errLevel - (Optional) Descriptive error level info (error|success|warning|info)
   * @param {String} date_created_str - (Optional) Date created string in YYYY/MM/DD format. Required if fetching ErrorLogItem documents.
   * @param {String} log_type - ErrorLogDoc (doc) or ErrorLogItem (stack) document types. Defaults to "stack"
   * @returns {Object[]} Firestore ErrorLog documents
   */
  async getErrorLogs ({ type, category, errLevel, date_created_str, log_type = LOG_OBJ_TYPE.STACK }) {
    try {
      this.isValidErrorLog({ type, category })

      let docRef = db
        .collection(LOG_COLLECTION)
        .doc(type)
        .collection(category)

      if (date_created_str !== undefined) {
        docRef = docRef.where('date_created_str', '==', date_created_str)
      }

      if (errLevel !== undefined) {
        docRef = docRef.where('level', '==', errLevel)
      }

      docRef = docRef.where('log_type', '==', log_type)

      return await docRef
        .get()
        .then((snapshot) => snapshot.docs.map((doc) => doc.data()))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Retrieve a single ErrorLog document by ID (document name)
   * @typedef {Object} params - Input parameters
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   * @param {String} docId - Firestore document ID
   * @returns {Object} (1) ErrorLog Firestore document response
   */
  async getErrorLogById ({ type, category, docId }) {
    return await db
      .collection(LOG_COLLECTION)
      .doc(type)
      .collection(category)
      .doc(docId)
      .get()
  }

  /**
   * Creates an ErrorLog object to store as an ErrorItem or ErrorDoc.
   * @typedef {Object} params - Input parameters
   * @param {String} message - Error message string
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   * @param {String} errLevel - Descriptive error level info (error|success|warning|info)
   * @returns {Object}
   */
  constructErrorObject ({ message, type, category, errLevel }) {
    try {
      this.isValidErrorLog({ type, category })

      if (!Object.values(LOG_LEVELS).includes(errLevel)) {
        throw new Error(`Invalid error level - ${errLevel}`)
      }

      const tsNow = this.getDateNowFirestore()
      const docId = this.generateDocId(`${LOG_COLLECTION}/${type}/${category}`)

      return {
        id: docId,
        level: errLevel,
        type,
        category,
        message,
        date_created: tsNow.timestamp,
        date_created_str: tsNow.timestamp_str
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Generates a Firestore document ID for a document under a root or nested subcollection
   * @param {String} pathToDocument - Full path to a Firestore collection or (nested) subcollection
   * @returns {String} Firestore document ID
   */
  generateDocId (pathToDocument) {
    return db.collection(pathToDocument).doc().id
  }

  /**
   * Checks for valid ErrorLog type and category (Firestore document and subcollection paths)
   * @typedev {Object} Input parameters
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   */
  isValidErrorLog ({ type, category }) {
    const logTypes = Object.values(LOG_OBJECTS)

    if (!logTypes.includes(type)) {
      throw new Error(`Invalid log document - ${type}.`)
    }

    if (!Object.values(LOG_CATEGORIES[type]).includes(category)) {
      throw new Error(`Invalid log type category - ${category}.`)
    }

    return true
  }

  /**
   * Returns the Firestore timestamp now date
   * @returns {Object}
   *  - timestamp {Object}: Firestore timestamp of the date now
   *  - timestamp_str {String}: "timestamp" in "YYYY/MM/DD" string format
   */
  getDateNowFirestore () {
    const tsNow = admin.firestore.Timestamp.now()

    return {
      timestamp: tsNow,
      timestamp_str: dayjsUTC(tsNow.toDate()).tz(this.timezone).format(this.dateStrFormat)
    }
  }

  /**
   * Returns a Firestore timestamp date from a given date
   */
  getDateFirestore (date) {
    const tsDate = admin.firestore.Timestamp.fromDate(date)

    return {
      timestamp: tsDate,
      timestamp_str: dayjsUTC(tsDate.toDate()).tz(this.timezone).format(this.dateStrFormat)
    }
  }
}

module.exports = ErrorLog
