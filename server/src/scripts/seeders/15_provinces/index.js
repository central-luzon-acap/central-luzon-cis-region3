const { upsertprovincesinfo } = require('../../../classes/provinces')
const setDefaultProvincesInfo = require('./defaultprovincesinfo')

/**
 * Generate and upload default provinces information (code name, full province name)
 * from provinces defined in the /constant_data/region document to the
 * the /constant_data/provinces_info document
 */
const main = async () => {
  let data

  try {
    data = await setDefaultProvincesInfo()
  } catch (err) {
    console.log(`[PROVINCES] :Error, ${err.message}`)
    process.exit(1)
  }

  try {
    console.log('[PROVINCES]: Uploading the default provinces data...')

    await upsertprovincesinfo(data)
    console.log('[PROVINCES]: Firestore upload success!')
    process.exit(0)
  } catch (err) {
    console.log(`[PROVINCES] :Error, ${err.message}`)
    process.exit(1)
  }
}

(async () => {
  await main()
})()
