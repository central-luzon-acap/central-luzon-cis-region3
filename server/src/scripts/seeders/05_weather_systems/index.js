const { upsertseasonalregional, getseasonalregionaldoc } = require('../../../classes/regionalseasonal')
const { FIRESTORE_DOCUMENTS, REGION } = require('../../../utils/constants')
const data = require('./data.json')

/**
 * Create default values for the common regional seasonal weather forecast - miscellaneous systems that may affect the weather data.
 * in a Firestore document /weather_forecasts/bicol/seasonal_regional/misc_weather_systems
 */
const seedMiscWeatherSystems = async () => {
  try {
    // Upsert the regional seasonal weather forecast rainfall data
    await upsertseasonalregional({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.MISC_WEATHER_SYSTEMS,
      data,
      user: {
        email: 'system',
        id: '-'
      }
    })
  } catch (err) {
    console.log(err.message)
  }

  try {
    // Fetch and return the newly-created or updated document
    const doc = await getseasonalregionaldoc({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.MISC_WEATHER_SYSTEMS
    })

    if (!doc.exists) {
      console.log('Failed to fetch common data.')
    } else {
      console.log(doc.data())
      console.log(`Inserted ${doc.data().data.length} items as sub data items.`)
    }
  } catch (err) {
    console.log(err.message)
  }
}

(async () => {
  await seedMiscWeatherSystems()
})()
