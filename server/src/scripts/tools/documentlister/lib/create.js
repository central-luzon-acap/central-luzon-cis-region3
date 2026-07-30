const DocumentLister = require('./documentlister')
const { FIRESTORE_COLLECTIONS } = require('../../../../utils/constants')

const create = (documentName, collectionName) => {
  return new DocumentLister({
    collectionPath: `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES}/${documentName}/${collectionName}`,
    documentPath: `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES}/${documentName}`
  })
}

module.exports = create
