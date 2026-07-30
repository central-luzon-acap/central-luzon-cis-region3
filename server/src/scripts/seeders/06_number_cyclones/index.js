const { upsertseasonalregional } = require('../../../classes/regionalseasonal')
const { getforecast } = require('../../../classes/seasonalforecast')
const { FIRESTORE_DOCUMENTS, REGION, DEFAULT_PROVINCE } = require('../../../utils/constants')
const data = require('./data.json')

/**
 * Create default values for the common regional seasonal weather forecast - miscellaneous systems that may affect the weather data.
 * in a Firestore document /weather_forecasts/bicol/seasonal_regional/misc_weather_systems
 */
const main = async () => {
  let monthsReference

  try {
    console.log('Fetching the seasonal months reference...')

    // Get the latest seasonal months reference from a random province
    monthsReference = await getforecast({
      region: REGION,
      province: DEFAULT_PROVINCE
    })

    if (!monthsReference.exists) {
      throw new Error('Failed to fetch the reference months data.')
    }
  } catch (err) {
    throw new Error(err)
  }

  try {
    console.log('Uploading default Number of Tropical Cyclones data to Firestore...')

    // Upsert the regional seasonal weather forecast rainfall data
    await upsertseasonalregional({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT,
      data: monthsReference.data().months.map((item, id) => ({
        id,
        month: item.mo,
        value: data[id].value
      })),
      user: {
        email: 'system',
        id: '-'
      }
    })

    console.log('Upload success!')
    process.exit(0)
  } catch (err) {
    throw new Error(err)
  }
}

(async () => {
  try {
    await main()
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
})()
