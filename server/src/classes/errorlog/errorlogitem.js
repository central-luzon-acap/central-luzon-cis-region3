const { db } = require('../../utils/db')
const { LOG_COLLECTION, LOG_OBJ_TYPE } = require('./constants')
const ErrorLog = require('./errorlog')

/**
 * Store error information as an Object in a logs[] field inside a "YYYY-MM-DD" named ErrorLog document.
 * This type of error log has field "log_type=stack".
 */
class ErrorLogItem extends ErrorLog {
  /**
   * Creates an ErrorLogItem (stack) type of ErrorLog document.
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
      let errorLogContainer

      const errorLogItem = this.constructErrorObject({ message, type, category, errLevel })
      const targetDate = this.getDateNowFirestore()

      const dateNowStr = targetDate.timestamp_str
      const docId = dateNowStr.replace(/\//g, '-')

      // ErrorLog document reference
      const docRef = db
        .collection(LOG_COLLECTION)
        .doc(type)
        .collection(category)
        .doc(docId)

      // Retrieve existing ErrorLog
      const errorLogDoc = await this.getErrorLogById({ type, category, docId })

      if (errorLogDoc.exists) {
        console.log(`[ERROR-LOG]: Inserting ErrorItem ID [${errorLogItem.id}] to existing ErrorLog on [${docId}]...`)
        console.log(`[ERROR-LOG]: Error message: "${errorLogItem.message}"`)

        // Insert into the logs[] array of an existing ErrorLog
        errorLogContainer = errorLogDoc.data()

        return await docRef.update({
          logs: [...errorLogContainer.logs, errorLogItem]
        })
      } else {
        // Construct the ErrorLog container and its new ErrorLog item
        errorLogContainer = {
          type: errorLogItem.type,
          category: errorLogItem.category,
          date_created: targetDate.timestamp,
          date_created_str: dateNowStr,
          logs: [errorLogItem],
          log_type: 'stack'
        }

        console.log(`[ERROR-LOG]: Creating new ErrorLog date [${docId}]...`)
        console.log(`[ERROR-LOG]: Inserting ErrorItem ID [${errorLogItem.id}] to new ErrorLog...`)
        console.log(`[ERROR-LOG]: Error message: "${errorLogItem.message}"`)

        return await docRef.set(errorLogContainer)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Retrieves a list of "ErrorLogItem" logs by type and category.
   * @typedef {Object} params - Input parameters
   * @returns
   */
  async getErrorLogs ({ type, category, date_created_str }) {
    if (date_created_str === undefined) {
      // throw new Error('The "date_created_str" field is required')
    }

    return super.getErrorLogs({
      type,
      category,
      date_created_str,
      // ErrorLogItem (item) document type. Defaults to "stack".
      log_type: LOG_OBJ_TYPE.STACK
    })
  }
}

module.exports = ErrorLogItem
