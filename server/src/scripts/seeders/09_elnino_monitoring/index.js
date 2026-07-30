const { settyphooninformation } = require('../../../classes/typhoonadvisory')

const data = require('./data.json')

/**
 * Create default values for the El Nino/La Nina Monitoring data until
 * the automatic updater (npm run cron:typhoon) can be set up.
 * Uploads data in a Firestore document: /w_services/typhoon_advisory
 */
const main = async () => {
  try {
    console.log('Uploading the default El Nino / La Nina Monitoring data to Firestore...')

    // Upload scraped data to Firestore
    await settyphooninformation({
      img: data.images[0],
      description: data.descriptions.join(' '),
      reference: data.url,
      updated_by: 'system'
    })

    console.log('Firestore update success.')
    console.log(JSON.stringify(data))
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
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
