const { upserttendayregional, gettendayregionaldoc } = require('../../../classes/regionaltenday')
const { FIRESTORE_DOCUMENTS, REGION } = require('../../../utils/constants')
const data = require('./data.json')

/**
 * Create default values for the common regional 10-day weather forecast - moon phases data
 * in a Firestore document /weather_forecasts/bicol/seasonal_tenday/moon_phases.
 */
const seedMoonPhases = async () => {
  try {
    // Upsert the regional seasonal weather forecast rainfall data
    await upserttendayregional({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES,
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
    const doc = await gettendayregionaldoc({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_TENDAY.MOON_PHASES
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
  await seedMoonPhases()
})()
