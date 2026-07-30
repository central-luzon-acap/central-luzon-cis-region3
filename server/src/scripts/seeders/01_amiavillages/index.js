const path = require('path')
const { CsvToFireStore, FirestoreData } = require('csv-firestore')
const SimpleDataFormat = require('../lib/simpledataformat')
const { CONSTANT_STATIC_COLLECTION, DOCUMENTS } = require('../lib/constants')

// Uploads the AMIA villages data to /constant_data/amia_villages
async function main () {
  // Firestore data upload handler
  const Firestore = new FirestoreData()

  // AMIA Villages data
  const handler = new CsvToFireStore(path.join(__dirname, '..', '..', 'data', 'amia_villages_r5.csv'))
  const data = new SimpleDataFormat({
    title: 'AMIA Villages',
    description: 'List of AMIA villages containing province, municipality and barangays with lat/lon and other information.',
    udpated_by: 'acap',
    date_created: Firestore.admin.firestore.Timestamp.now()
  })

  try {
    console.log('Reading data...')
    await handler.readCSV()
    data.setData(handler.data())

    console.log('Uploading AMIA Villages data to Firestore...')
    await Firestore.db
      .collection(CONSTANT_STATIC_COLLECTION)
      .doc(DOCUMENTS.AMIA_VILLAGES)
      .set(data.getFormattedData())

    console.log('Upload success!')
    process.exit(0)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

main()
