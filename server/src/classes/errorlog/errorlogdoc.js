const { db } = require('../../utils/db')
const { LOG_COLLECTION, LOG_OBJ_TYPE } = require('./constants')
const ErrorLog = require('./errorlog')

/**
 * Store error information as document to DB following the path "logs/<type>/<category>/{docId}".
 * This type of error log has field "log_type=document".
 * Example: "logs/cron/tenday/{docId}"
 */
class ErrorLogDoc extends ErrorLog {
  /**
   * Creates an ErrorLogDoc (doc) type of ErrorLog document.
   * @typedef {Object} params - Input parameters
   * @param {String} message - Error message string
   * @param {String} type - Error general classification group (Firestore document)
   * @param {String} category - Error Specific category (Firestore subcollection)
   * @param {String} errLevel - Descriptive error level info (error|success|warning|info)
   * @returns {Promise}
   * @throws {Error}
   */
  async createLog ({ message, type, category, errLevel }) {
    try {
      const errorLogItem = this.constructErrorObject({ message, type, category, errLevel })
      const dateNow = this.getDateNowFirestore()

      console.log(`[ERROR-LOG]: Logging error info ID [${errorLogItem.id}] on ${dateNow.timestamp_str}...`)
      console.log(`[ERROR-LOG]: "${errorLogItem.message}"`)

      return await db
        .collection(LOG_COLLECTION)
        .doc(type)
        .collection(category)
        .doc(errorLogItem.id)
        .set({ ...errorLogItem, log_type: 'document' })
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Retrieves a list of "ErrorDoc" logs by type and category.
   * @typedef {Object} params - Input parameters
   * @returns
   */
  async getErrorLogs ({ type, category, errLevel, date_created_str }) {
    return super.getErrorLogs({
      type,
      category,
      errLevel,
      date_created_str,
      // ErrorLogDoc (doc) document type. Defaults to "doc".
      log_type: LOG_OBJ_TYPE.DOCUMENT
    })
  }
}

module.exports = ErrorLogDoc
