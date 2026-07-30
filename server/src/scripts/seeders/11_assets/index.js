require('dotenv').config()
const path = require('path')
const { FirestoreData, CsvToFireStore } = require('csv-firestore')
const { FIRESTORE_COLLECTIONS } = require('../../../utils/constants')
const { DOCUMENTS } = require('../lib/constants')

/**
 * Uploads information about the live URL links and description of various assets (mostly hi-resolution images) and files
 * used by ACAP. These data are used during build time, and referenced for file downloads.
 *
 * SPECIAL NOTES:
 *
 * This script requires accessible assets and graphics files uploded on Firebase Storage, or any remote accessible storage that can display pictures.
 * Checkout the /src/scripts/data/assets_dev.csv (or assets_prod.csv) the data file for more information of ACAP's existing image file URLs.
 * Update it's content, specially the "URL" and "description" columns as needed.
 *
 * In the /src/scripts/data/assets_dev.csv CSV file:
 *
 * - category = "og" refers to the hi-resolution opengraph graphic image files inserted in the public page's header for social media sharing
 * - category = "bulletins" are a series of hi-resolution graphic image files displayed as thumbnails the public /bulletins page.
 *      Not adding values for these items will make ACAP use their low-resolution counterparts inside the /client/public/images/thumbnails directory.
 */
const main = async () => {
  const Firestore = new FirestoreData()

  const assetsFile = 'assets_dev.csv' // or 'assets_prod.csv' for production
  const assets = new CsvToFireStore(path.resolve(__dirname, '..', '..', 'data', assetsFile))

  try {
    await assets.readCSV()
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }

  const jsonData = {
    description: 'Opengraph image URL links',
    data: assets.data()
  }

  try {
    console.log(`[PROCESS]: Saving assets data references to Firestore /${FIRESTORE_COLLECTIONS.PAGE_ASSETS}/${DOCUMENTS.ASSETS_OPENGRAPH}...`)

    await Firestore.db
      .collection(FIRESTORE_COLLECTIONS.PAGE_ASSETS)
      .doc(DOCUMENTS.ASSETS_OPENGRAPH)
      .set(jsonData)

    console.log('[PROCESS]: Firestore upload succeess.')
  } catch (err) {
    console.log('[ERROR]: Error uploading data. ', err.message)
    process.exit(1)
  }
}

main()
