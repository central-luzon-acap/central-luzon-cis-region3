require('dotenv').config()
const { dayjsUTC } = require('../../../utils/dayjs_utc')

const {
  upsertforecast_tenday,
  createDocumentID
} = require('../../../classes/tendayforecast')
const { DATA_TYPE } = require('../../../classes/sharedweatherforecast/tenday')
const downloadValidateExcel = require('./lib/download')
const archiveForecast = require('./lib/archive')
const initialize = require('./lib/initialize')
const calendarsync = require('./lib/calendarsync')
const { logError, deleteErrorDoc, createSharedForecast } = require('./lib/log')

const { REGION } = require('./lib/constants')
const { delDir } = require('../../../utils/dir')

// Download all 10 Daily Weather Forecast excel files
// Parse and validate relevant data and (optional) write processed data to CSV
// Return validated data as Object[]
const main = async () => {
  const baseUrl = process.env.PAGASA_10DAY_EXCEL_BASE_URL
  const files = []
  const max = 10
  let extractedData = []

  const SKIP_RCMAS_API = process.env.IS_RMCAS_API_ACTIVE === '1'
    ? ''
    : 'Skipping'

  // Archive old data
  if (
    process.env.ARCHIVE_TENDAY_FORECAST === '1' &&
    process.env.IS_RMCAS_API_ACTIVE === '1'
  ) {
    const dayNow = dayjsUTC(new Date()).tz('Singapore')
    const dayYesterday = dayNow.subtract(1, 'day').format('YYYY/MM/DD')

    try {
      console.log(`[PROCESS]: Starting the ten-day archiving process on [${dayNow.format('YYYY/MM/DD')}], ${dayNow.toISOString()}.`)
      console.log(`[PROCESS]: Archiving the "current" weather forecast data containing yesterday's expected "date_created" date [${dayYesterday}]...`)
      await archiveForecast(dayYesterday)
    } catch (err) {
      console.log(`[WARNING]: ${err.message}. Skipping archiving...\n`)
    }

    try {
      // Delete old (yesterday) ErrorLog document
      console.log(`[PROCESS]: Deleting yesterday's ErrorLog doc on date [${dayYesterday}]...\n`)
      await deleteErrorDoc(dayYesterday.replace(/\//g, '-'))
    } catch (err) {
      console.log(`[WARNING]: Error deleting the ErrorLog doc: ${err.message}...\n`)
    }
  }

  // Only initialize the resources and constants
  const { dirPath, forecast, BicolExcel, REGION_LOCATIONS } = await initialize({
    returnParser: true,
    shouldUpdate: false,
    deleteTempDir: false
  })

  // Download excel, validate and extract data
  for (let i = 1; i <= max; i += 1) {
    files.push(downloadValidateExcel({
      REGION_LOCATIONS,
      url: `${baseUrl}/day${i}.xlsx`,
      storagePath: dirPath,
      dest: `day${i}.xlsx`,
      ExcelDefinition: BicolExcel,
      dayNum: i
      // tocsv: true
    }))
  }

  // Process the extracted, validated data
  try {
    console.log('[PROCESS]: Downloading excel files...')
    extractedData = await Promise.all(files)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    await logError(err.message)
    await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })

    process.exit(1)
  }

  if (extractedData.length === max) {
    // Validate extracted ordinal dates. Use the 1st province-municipality data on Day 1 as reference
    const baseDateRange = extractedData[0][0].date_range
    const uniqueDates = [extractedData[0][0].day_format]
    let datesError = ''

    // Validate dates for Day 2 - Day 10
    for (let i = 1; i < 10; i += 1) {
      const succeedingDateRange = extractedData[i][0].date_range

      // Validate date range validity period
      if (succeedingDateRange !== baseDateRange) {
        datesError = `[ERROR]: Validity date range mismatch on Day ${i + 1}, ${succeedingDateRange}. Start date should be ${baseDateRange} (Day 1).`
        break
      }

      // Validate unique dates
      const currentDate = extractedData[i][0].day_format
      if (uniqueDates.includes(currentDate)) {
        datesError = `[ERROR]: Day ${i + 1}, date ${currentDate} is not a unique date.`
        break
      }
    }

    if (datesError !== '') {
      console.log(datesError)
      await logError(datesError)
      await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })

      process.exit(1)
    }

    console.log(`[PROCESS]: Download and validation done on (${extractedData.length}) 10-day weather excel files.`)
    const provinces = {}

    // Filter days by municipality under province
    extractedData.forEach((day, index) => {
      day.forEach(row => {
        if (provinces[row.province] === undefined) {
          provinces[row.province] = {}
        }

        if (provinces[row.province][row.municipality] === undefined) {
          provinces[row.province][row.municipality] = []
        }

        provinces[row.province][row.municipality].push({ ...row, day: (index + 1) })
      })
    })

    try {
      // Upload the new 10-day weather forecast data to Firestore
      const upload = []
      let stats = ''

      const id = createDocumentID(REGION)

      for (const province in provinces) {
        stats += ` - [${province}]: ${Object.keys(provinces[province])}\n`
        upload.push(upsertforecast_tenday({
          id,
          region: REGION,
          province,
          municipalities: provinces[province]
        }))
      }

      console.log(`[PROCESS]: Generated ID: ${id}`)
      console.log(`[PROCESS]: Uploading (${upload.length}) provinces 10-day weather forecast data to Firestore...`)
      console.log(stats)

      await Promise.all(upload)
      console.log('[PROCESS]: Firestore upload succeess.')
    } catch (err) {
      console.log(`[ERROR]: ${err.message}`)
      await logError(err.message)
      await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })

      process.exit(1)
    }
  } else {
    const errStr = `[PROCESS]: Something went wrong. Files parsed: ${extractedData.length}`
    console.log(errStr)
    await logError(errStr)
    await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })

    process.exit(1)
  }

  try {
    // Sync the latest 10-day weather forecast and cropping calendar municipalities
    console.log('[PROCESS]: Updating the provinces and municipalities masterlists')
    await calendarsync({ forecastlist: forecast })
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }

  try {
    // Create a regular formatted 10-day weather forecast data for the sharing API
    console.log(`[PROCESS]: ${SKIP_RCMAS_API} Updating the "active" shared 10-day weather forecast data`)
    await createSharedForecast({ region: REGION, type: DATA_TYPE.REGULAR })
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }

  // Delete temporary download directory
  try {
    await delDir(dirPath)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }
}

main()

/**
// Uncomment to create errors for the 10-day weather forecast data logs and
// to create a an error 10-day weather forecast doc for the shared API
// Also, comment-out the main() function

const raiseError = async () => {
  await logError('Sample error here')
  await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })
  console.log('done')
}

raiseError()
*/
