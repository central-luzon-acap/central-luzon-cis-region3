// const ErrorLog = require('./errorlog')
const ErrorLogDoc = require('./errorlogdoc')
const ErrorLogItem = require('./errorlogitem')

const {
  LOG_COLLECTION,
  LOG_LEVELS,
  LOG_TYPES,
  LOG_OBJECTS,
  LOG_CATEGORIES
} = require('./constants')

const ED = new ErrorLogDoc()
const EI = new ErrorLogItem()

/**
  * Retrieve a single ErrorLog document by ID
  * @typedef {Object} params - Input parameters
  * @param {String} type - Error general classification group (Firestore document)
  * @param {String} category - Error Specific category (Firestore subcollection)
  * @param {String} docId - Firestore document ID
  * @returns {Object} (1) ErrorLog Firestore document response
  */
const getErrorLogById = ED.getErrorLogById.bind(ED)

/**
  * Deletes a single ErrorLog document by ID (document name)
  * @typedef {Object} params - Input parameters
  * @param {String} type - Error general classification group (Firestore document)
  * @param {String} category - Error Specific category (Firestore subcollection)
  * @param {String} docId - Firestore document ID
  * @returns {Promise}
  */
const deleteLogById = ED.deleteLogById.bind(ED)

/**
  * Retrieves a list of "ErrorDoc" (doc) logs by type and category
  * @typedef {Object} params - Input parameters
  * @param {String} type - Error general classification group (Firestore document)
  * @param {String} category - Error Specific category (Firestore subcollection)
  * @param {String} errLevel - (Optional) Descriptive error level info (error|success|warning|info)
  * @param {String} date_created_str - (Optional) Date created string in YYYY/MM/DD format
  * @returns {Object[]} Firestore ErrorLog documents
  */
const getErrorDocLogs = ED.getErrorLogs.bind(ED)

/**
  * Retrieves a list of "ErrorItem" (stack) logs by type and category
  * @typedef {Object} params - Input parameters
  * @param {String} type - Error general classification group (Firestore document)
  * @param {String} category - Error Specific category (Firestore subcollection)
  * @param {String} date_created_str - (Optional) Date created string in YYYY/MM/DD format
  * @returns {Object[]} Firestore ErrorLog documents
  */
const getErrorItemLogs = EI.getErrorLogs.bind(EI)

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
const createLogDoc = ED.createLog.bind(ED)

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
const createLogItem = EI.createLog.bind(EI)

module.exports = {
  LOG_COLLECTION,
  LOG_LEVELS,
  LOG_TYPES,
  LOG_OBJECTS,
  LOG_CATEGORIES,
  createLogDoc,
  createLogItem,
  deleteLogById,
  getErrorLogById,
  getErrorDocLogs,
  getErrorItemLogs
}
