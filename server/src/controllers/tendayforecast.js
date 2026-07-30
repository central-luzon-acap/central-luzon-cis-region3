const path = require('path')
const validateExcel = require('../scripts/cron/update_tenday_weather/lib/validate')
const { upsertforecast_tenday } = require('../classes/tendayforecast')
const initialize = require('../scripts/cron/update_tenday_weather/lib/initialize')
const calendarsync = require('../scripts/cron/update_tenday_weather/lib/calendarsync')
const { logError, deleteErrorDoc, createSharedForecast } = require('../scripts/cron/update_tenday_weather/lib/log')
const archiveForecast = require('../scripts/cron/update_tenday_weather/lib/archive')
const { delDir } = require('../utils/dir')
const { dayjsUTC } = require('../utils/dayjs_utc')
const {
  upserttendayregional,
  gettendayregionaldoc
} = require('../classes/regionaltenday')
const { REGION, DOWNLOAD_DIR } = require('../../src/scripts/cron/update_tenday_weather/lib/constants')
const { DATA_TYPE } = require('../classes/sharedweatherforecast/tenday')

/**
 * Delete the temporary upload directory containing the 10-day weather forecast Excel files
 * @returns {Promise}
 */
const deleteExcelDirectory = async (fileDirectory) => {
  try {
    console.log(`[PROCESS]: Deleting the uploaded 10-day Excel files in ${fileDirectory}...`)
    return await delDir(fileDirectory)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }
}

module.exports.upsertForecastTen = async (req, res, next) => {
  if (req.files === undefined) {
    return res.status(500).send('Please upload (10) excel files.')
  }

  if (req.fileValidationError) {
    return res.status(500).send(req.fileValidationError)
  }

  const processed = []
  let data = []
  const maxDays = 10
  const fileDirectory = path.join(__dirname, '..', '..', DOWNLOAD_DIR, req.user.uid, req.randomToken)
  const SKIP_RCMAS_API = process.env.IS_RMCAS_API_ACTIVE === '1'
    ? ''
    : 'Skipping'

  if (req.files.length !== maxDays) {
    return res.status(500).send('Please upload (10) excel files.')
  }

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

  // Initialize the excel file definition and constants
  const { forecast, BicolExcel, REGION_LOCATIONS } = await initialize({
    localfile: path.join(fileDirectory, 'day1.xlsx'),
    returnParser: true,
    shouldUpdate: false,
    deleteTempDir: false
  })

  // Validate excel files and get processed data
  for (let i = 1; i <= maxDays; i += 1) {
    const excelFile = path.join(fileDirectory, `day${i}.xlsx`)
    processed.push(validateExcel({
      excelFile,
      ExcelDefinition: BicolExcel,
      dayNum: i,
      REGION_LOCATIONS
    }))
  }

  try {
    data = await Promise.all(processed)
  } catch (err) {
    await deleteExcelDirectory(fileDirectory)
    await logError(err.message)
    await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })
    return next(new Error(err))
  }

  if (data.length === maxDays) {
    // Validate extracted dates. Use the 1st province-municipality data on Day 1 as reference
    const baseDateRange = data[0][0].date_range
    const uniqueDates = [data[0][0].day_format]
    let datesError = ''

    // Validate dates for Day 2 - Day 10
    for (let i = 1; i < 10; i += 1) {
      const succeedingDateRange = data[i][0].date_range

      // Validate date range validity period
      if (succeedingDateRange !== baseDateRange) {
        datesError = `[ERROR]: Validity date range mismatch on Day ${i + 1}, ${succeedingDateRange}. Start date should be ${baseDateRange} (Day 1).`
        break
      }

      // Validate unique dates
      const currentDate = data[i][0].day_format
      if (uniqueDates.includes(currentDate)) {
        datesError = `[ERROR]: Day ${i + 1}, date ${currentDate} is not a unique date.`
        break
      }
    }

    if (datesError !== '') {
      await deleteExcelDirectory(fileDirectory)
      await logError(datesError)
      await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })
      return next(new Error(datesError))
    }

    const provinces = {}

    // Filter across days by municipality under province
    data.forEach((day, index) => {
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

    // Upload to firestore
    const upload = []

    for (const province in provinces) {
      upload.push(upsertforecast_tenday({
        region: REGION,
        province,
        municipalities: provinces[province],
        user: {
          email: req.user.email,
          id: req.user.user_id
        }
      }))
    }

    try {
      await Promise.all(upload)
    } catch (err) {
      await deleteExcelDirectory(fileDirectory)
      await logError(err.message)
      await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })
      return next(new Error(err))
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

    // Delete the temp folder and Excel files
    await deleteExcelDirectory(fileDirectory)

    return res.status(200).send('Data upload succeess.')
  } else {
    return next(new Error('Not all data were processed.'))
  }
}

// Update the global (common) regional 10-day weather forecast data
module.exports.updateForecastRegionalTenday = async (req, res, next) => {
  const { data, region, type } = req.body

  try {
    // Upsert the common regional 10-day weather forecast data
    await upserttendayregional({
      region,
      documentName: type,
      data,
      user: {
        email: req.user.email,
        id: req.user.user_id
      }
    })
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Fetch and return the newly-created or updated document
    const doc = await gettendayregionaldoc({
      region,
      documentName: type
    })

    if (!doc.exists) {
      return next(new Error('Failed to fetch common data.'))
    } else {
      return res.status(200).send(doc.data())
    }
  } catch (err) {
    return next(new Error(err))
  }
}
