const { admin } = require('../../../utils/db')
const { setcycloneinformation } = require('../../../classes/cyclone_advisory')
const defaultData = require('../../../classes/cyclone_advisory/data')
// const defaultData = require('../../../classes/cyclone_advisory/data_has_cyclone')

/**
 * Uploads an empty tropical cyclone (special) weather forecast data to serve as the default
 * special weather forecast data until the automatic updater (npm run cron:cyclone) can be set up.
 * Uploads data to /weather_forecasts/bicol/seasonal_regional/cyclones_count
 */
async function main () {
  // Tropical cyclone default data
  const cycloneData = { ...defaultData }
  defaultData.date_created = admin.firestore.Timestamp.now()

  try {
    console.log('Uploading default Tropical Cyclone data to Firestore...')
    await setcycloneinformation(cycloneData)

    console.log('Upload success!')
    process.exit(0)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

main()
