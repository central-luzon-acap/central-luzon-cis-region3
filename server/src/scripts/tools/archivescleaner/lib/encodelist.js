const ArchivesCleaner = require('./archivescleaner')
const { FIRESTORE_COLLECTIONS, DEFAULT_PROVINCE } = require('../../../../utils/constants')

const MAX_MONTHS = 3

/**
 * Adds new document IDs to designated archived 10-day or seasonal "list[]" document ID tracker
 * @typedef {Object} params
 * @param {String} documentId - Firestore document ID
 * @param {String} province - Province name connected with the documentId
 * @param {String} type - Archived weather forecast type. One of seasonal|tenday
 */
const encodeToList = async ({ documentId, province = '', type = 'tenday' }) => {
  try {
    let documentName = FIRESTORE_COLLECTIONS.TEN_DAY

    switch (type) {
      case 'tenday':
        documentName = FIRESTORE_COLLECTIONS.TEN_DAY
        break
      case 'seasonal':
        documentName = FIRESTORE_COLLECTIONS.SEASONAL
        break
      default:
        break
    }

    // Push an item to list only once for all provinces
    if (province !== DEFAULT_PROVINCE) {
      return
    }

    const lister = new ArchivesCleaner({
      listPath: `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES}/${documentName}`,
      maxItems: MAX_MONTHS * 30
    })

    // Iniitialize the list
    await lister.init()

    // Push an item to list
    await lister.pushItem(documentId)
    console.log(`[LISTER]: Done processing ${documentId}`)
  } catch (err) {
    console.log(`[LISTER]: ${err.message}`)
  }
}

module.exports = encodeToList
