const {
  scrapecycloneinfo,
  setcycloneinformation,
  setlowresgraphic
} = require('../../../classes/cyclone_advisory')

const { archiveSpecialWeatherForecast } = require('../../../classes/sharedweatherforecast/special')

const main = async () => {
  let data

  try {
    // Archive the latest "active" special weather forecast if its bulletin # does not yet exist in the archives
    if (process.env.IS_RMCAS_API_ACTIVE === '1') {
      await archiveSpecialWeatherForecast()
    }
  } catch (err) {
    console.log(`[WARNING-ARCHIVING]: ${err.message}`)
  }

  try {
    data = await scrapecycloneinfo()
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    process.exit(1)
  }

  try {
    // Download the latest typhoon picture and upload its low-res version to Firebase Storage
    data.img_lowres = await setlowresgraphic(data.img)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    process.exit(1)
  }

  try {
    // Upload empty or cyclone-filled scraped data to Firestore
    await setcycloneinformation(data)
    console.log('Firestore update success.')
    console.log(JSON.stringify(data))
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    process.exit(1)
  }
}

main()
