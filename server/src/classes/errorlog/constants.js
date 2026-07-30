// Error logging
const LOG_COLLECTION = 'logs'

const LOG_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info'
}

const LOG_OBJ_TYPE = {
  /** Error log items (objects) are stored in a logs[] map Firestore field */
  STACK: 'stack',
  /** Error log items are stored in single Firestore documents */
  DOCUMENT: 'document'
}

const LOG_OBJECTS = {
  CRON: 'cron'
}

const LOG_CATEGORIES = {
  [LOG_OBJECTS.CRON]: {
    TENDAY: 'tenday',
    CYCLONE: 'cyclone',
    ELNINO: 'elnino'
  }
}

module.exports = {
  LOG_COLLECTION,
  LOG_LEVELS,
  LOG_OBJ_TYPE,
  LOG_OBJECTS,
  LOG_CATEGORIES
}
