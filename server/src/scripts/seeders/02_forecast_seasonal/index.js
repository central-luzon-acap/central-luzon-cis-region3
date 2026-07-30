const { upsertforecast, getforecastregion } = require('../../../classes/seasonalforecast')
const { SEASONAL_UPDATE_METHOD, REGION, PROVINCE_LIST } = require('../../../utils/constants')
const { generateDefaultSeasonalData } = require('./defaultseasonaldata')

/**
 * Create a minimal seasonal weather forecast firestore collection with default values
 * following the format in the "/src/scripts/data/weather_seasonal.json" file
 * using the defined REGION_NAME and PROVINCES values in the .env file.
 */
const seed = async () => {
  const { region, provinces } = generateDefaultSeasonalData(REGION, PROVINCE_LIST)
  let result
  const queries = []

  provinces.forEach((item) => {
    queries.push(upsertforecast({
      region,
      province: item.name,
      months: item.months,
      update_method: SEASONAL_UPDATE_METHOD.ENCODE,
      user: {
        email: 'system',
        id: 'system'
      }
    }))
  })

  try {
    result = await Promise.all(queries)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }

  if (result) {
    try {
      const docs = await getforecastregion(region)
      console.log(`Inserted ${docs.length} rows as documents.`)
    } catch (err) {
      console.log(err.message)
      process.exit(1)
    }
  }
}

(async () => {
  await seed()
})()
