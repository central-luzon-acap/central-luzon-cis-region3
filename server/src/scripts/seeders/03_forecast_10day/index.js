const path = require('path')
const validateExcel = require('../../cron/update_tenday_weather/lib/validate')
const validateFiles = require('./src/validatefiles')
const initialize = require('../../cron/update_tenday_weather/lib/initialize')
const { upsertforecast_tenday } = require('../../../classes/tendayforecast')
const { REGION } = require('../../cron/update_tenday_weather/lib/constants')

/**
 * Uploads an old static 10-day weather forecast data from PAGASA's 10-day weather excel files
 * downloaded on January 13, 2023, to serve as a default 10-day weather forecast data until
 * the automatic updater (npm run cron:tenday) can be set up or manually run for the 1st time.
 */
const main = async () => {
  const staticFileDirectory = path.join(__dirname, '..', '..', 'data', 'pagasa_10_day_excel')
  const excelFiles = []
  let weatherData = []

  try {
    const { BicolExcel, REGION_LOCATIONS } = await initialize({
      localfile: path.join(staticFileDirectory, 'day1.xlsx'),
      shouldUpdate: true,
      returnParser: true
    })

    // Initialize the local excel file paths
    for (let i = 1; i <= 10; i += 1) {
      excelFiles.push(await (validateExcel({
        REGION_LOCATIONS,
        excelFile: path.join(staticFileDirectory, `day${i}.xlsx`),
        ExcelDefinition: BicolExcel,
        dayNum: i
      })))
    }
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }

  try {
    // Validate and format data
    const data = await Promise.all(excelFiles)
    weatherData = validateFiles(data)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }

  try {
    // Upload to firestore
    const upload = []
    let stats = ''

    for (const province in weatherData) {
      stats += ` - [${province}]: ${Object.keys(weatherData[province])}\n`
      upload.push(upsertforecast_tenday({
        region: REGION,
        province,
        municipalities: weatherData[province]
      }))
    }

    console.log(`[PROCESS]: Uploading (${upload.length}) provinces 10-day weather forecast data to Firestore...`)
    console.log(stats)

    await Promise.all(upload)
    console.log('[PROCESS]: Firestore upload succeess.')
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

main()
