const { getmunicipalitiesreference } = require('../../../classes/municipalities')
const { upsertprovincesinfo } = require('../../../classes/provinces')
const data = require('./data.json')

/**
 * Upload custom provinces information (code name, full province name) from data.json
 * to the the /constant_data/provinces_info document.
 *
 * Run this script to alter the default values set by running "npm run seed:15_provinces"
 */
const upsertProvinceCodes = async () => {
  let provinces

  try {
    // Get the latest province names reference
    const doc = await getmunicipalitiesreference()

    provinces = (doc.exists)
      ? Object.keys(doc.data().data)
      : null

    if (!provinces) {
      throw new Error('The province names reference is empty.\nPlease run the 03_forecast_10day or cron:tenday scripts first and try again.')
    }
  } catch (err) {
    throw new Error(err.message)
  }

  // Validate provinces
  if (!provinces.every(province => Object.keys(data).includes(province))) {
    throw new Error('Not all provinces have data')
  }

  if (!Object.keys(data).every(province => provinces.includes(province))) {
    throw new Error('Data contains non-supported provinces.')
  }

  try {
    console.log('[PROVINCES]: Uploading the defined provinces data...')

    await upsertprovincesinfo(data)
    console.log('[PROVINCES]: Firestore upload success!')
    process.exit(0)
  } catch (err) {
    console.log(`[PROVINCES] :Error, ${err.message}`)
    process.exit(1)
  }
}

(async () => {
  await upsertProvinceCodes()
})()
