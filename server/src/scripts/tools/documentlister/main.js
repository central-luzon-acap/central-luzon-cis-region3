const create = require('./lib/create')
const { FIRESTORE_COLLECTIONS, DEFAULT_PROVINCE } = require('../../../utils/constants')

/**
 * Creates a "list[]" array field inside a designated document for tracking the deletion of excess documents.
 * Used for tracking the historical archived documents.
 */
const buildDocList = async () => {
  try {
    // 10-day weather forecast
    const listerTenday = create(FIRESTORE_COLLECTIONS.TEN_DAY, DEFAULT_PROVINCE)

    // Seasonal weather forecast
    const listerSeasonal = create(FIRESTORE_COLLECTIONS.SEASONAL, DEFAULT_PROVINCE)

    // Fetch documents
    console.log('Fetching documents...')

    const [docsTenday, docsSeasonal] = await Promise.all([
      listerTenday.getDocuments(),
      listerSeasonal.getDocuments()
    ])

    // Create array list from document IDs
    console.log(`Fetched (${docsTenday.length}) 10-day archives`)
    console.log(`Fetched (${docsSeasonal.length}) seasonal archives\n`)
    console.log('Creating array lists...')

    /* eslint-disable no-unused-vars */
    const [listTenday, listSeasonal] = await Promise.all([
      listerTenday.createDocumentList(docsTenday.map(item => item.date_created_str.replace(/\//g, '-'))),
      listerSeasonal.createDocumentList(docsSeasonal.map(item => item.doc_name))
    ])

    console.log('done.')
  } catch (err) {
    throw new Error(err.message)
  }
}

buildDocList()
