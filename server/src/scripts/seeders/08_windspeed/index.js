const { upsertspecialregional, getspecialregionaldoc } = require('../../../classes/regionalspecial')
const { FIRESTORE_DOCUMENTS, REGION, DEFAULT_PROVINCE } = require('../../../utils/constants')
const sampleWindspeedData = require('./samplewsdata')

/**
 * Create default values for the common regional special weather forecast - wind speed data
 * in a Firestore document /weather_forecasts/bicol/seasonal_special_weather/wind_speed.
 */
const seedWindSpeed = async () => {
  let data = []

  try {
    // Create sample wind speed data
    data = await sampleWindspeedData(DEFAULT_PROVINCE)
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    // Upsert the regional seasonal weather forecast rainfall data
    await upsertspecialregional({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED,
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
    const doc = await getspecialregionaldoc({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED
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
  await seedWindSpeed()
})()
