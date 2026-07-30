const path = require('path')
const CroppingCalendar = require('../classes/cropcalendar')
const ExcelAdapter = require('../../../cron/update_tenday_weather/classes/exceladapter/exceladapter')
const { DOWNLOAD_DIR } = require('../../../cron/update_tenday_weather/lib/constants')
const { REGION } = require('../../../../utils/constants')
const diff = require('./diff')

const WEATHER_DATASOURCE = {
  LOCAL_FILE: 'local_file',
  ONLINE_FILE: 'online_file',
  DATABASE: 'database'
}

/**
 * Initializes the 10-day weather forecast EXCEL file from local storage or URL download to use as reference for municipality names.
 * Checks for inconsistent (missing) municipality names from the cropping calendar CSV file and 10-day weather forecast EXCEL file.
 * @param {String[]} provinces - Province list to extract from the cropping calendar and weather forecast data
 * @param {Bool} weathersource - Data source for the 10-day weather forecast excel file referebce. One of WEATHER_DATASOURCE.
 * @param {String} calendarfile - Full local file path of a cropping calendar CSV file to use. Defaults to the (old) static cropping calendar CSV file if ommitted.
 * @param {String} weatherfile - Full local file path of a 10-day weather forecast EXCEL file to use, if weathersource=WEATHER_DATASOURCE.LOCAL_FILE.
 *    Defaults to the (old) static local weather excel file if ommitted.
 * @param {String} url - Optional download URL of a PAGASA 10-day weather forecast file. Defaults to process.env.PAGASA_10DAY_EXCEL_BASE_URL/day1.xlsx if ommitted.
 * @param {Bool} write - Write cropping calendar data logs to file. False by default.
 * @returns {Object} { missing, calendar, calendargroup, forecast }
 *    - missing: {Object[]} Missing municipalities in present in the cropping calendar but absent in the 10-day weather forecast file, and vice-versa
 *    - calendar: {Object[]} Cropping calendar data
 *    - calendargroup: {Object} Cropping calendar data grouped by province
 *    - forecast: {Object}
 *      - forecast.municipalities: {Object[]} Municipalities list built from the 10-day weather forecast data
 *        i.e.: [{ id, province, municipality },...]
 *      - forecast.formatted: {Object} data field contains a formatted provinces and municipalities object used for drop-down menus
 *        i.e., { metadata, data }
 */
const calendarinit = async ({
  weathersource = WEATHER_DATASOURCE.ONLINE_FILE,
  provinces,
  calendarfile,
  calendarData,
  weatherfile,
  url,
  write = false
}) => {
  try {
    if (!provinces) {
      throw new Error('Provinces are required.')
    }

    const calendarfilePath = calendarfile ?? path.join(__dirname, '..', '..', '..', 'data', 'cropping_calendar_v2.csv')
    const weatherfilePath = weatherfile ?? path.join(__dirname, '..', '..', '..', 'data', 'pagasa_10_day_excel', 'day1.xlsx')
    const tempWeatherFilePath = path.join(__dirname, '..', '..', '..', '..', '..', DOWNLOAD_DIR, 'day0.xlsx')
    const downloadUrl = url ?? `${process.env.PAGASA_10DAY_EXCEL_BASE_URL}/day1.xlsx`
    const scriptPath = path.join(__dirname, '..')

    let forecasthandler = {}
    let calendar = {}
    const forecast = {}

    // Read the uploaded cropping calendar file from disk storage if no external calendarData provided
    if (!calendarData) {
      console.log(`[CALENDAR]: Loadng data from a CSV file\n${calendarfilePath}`)
      calendar = new CroppingCalendar({ csvFilePath: calendarfilePath })
      await calendar.readCSV()
    } else {
      console.log('[CALENDAR]: Using calendar data from external input')
    }

    // Get the 10-day weather forecast data from the specified data source
    if (weathersource === WEATHER_DATASOURCE.ONLINE_FILE) {
      // Fetch and load the latest online excel data data
      forecasthandler = new ExcelAdapter({
        pathToFile: tempWeatherFilePath,
        url: downloadUrl
      })

      console.log(`[CALENDAR]: Downloading 10-day weather excel file from ${downloadUrl}...`)
      await forecasthandler.init()
    } else if (weathersource === WEATHER_DATASOURCE.LOCAL_FILE) {
      // Use the (old) sample excel data
      console.log(`\n[CALENDAR]: Loading 10-day weather excel file from local storage\n${weatherfilePath}`)
      forecasthandler = new ExcelAdapter({ pathToFile: weatherfilePath })
    } else if (weathersource === WEATHER_DATASOURCE.DATABASE) {
      console.log('\n[CALENDAR]: Downloading 10-day weather excel file from Firestore DB...')
      forecasthandler = new ExcelAdapter({ pathToFile: weatherfilePath })
      await forecasthandler.fetchweathermunicipalities(REGION)
    }

    forecast.municipalities = forecasthandler.longlistmunicipalities(provinces)
    forecast.formatted = forecasthandler.shaperegionlocationsdata(forecasthandler.shapeJsonData(provinces))

    const {
      missmatching: missing
    } = await diff({ forecast: forecast.municipalities, calendar: calendarData ?? calendar.data() })

    if (missing.length > 0) {
      console.log(`[WARNING] (${missing.length}) municipalities are not present on the 10-day weather forecast file or cropping calendar.`)
    }

    // Write logs to file
    if (write) {
      console.log('\n[CALENDAR]: Writing data and logs to CSV...')
      calendar.write(calendar.data(), path.join(scriptPath, 'data.csv'))

      if (missing.length > 0) {
        calendar.write(missing, path.join(scriptPath, 'missing.csv'))
      }

      // Cropping Calendar-specific tables and firestore collection names
      const newTables = {
        provinces: 'n_provinces',
        municipalities: 'n_municipalities',
        crops: 'n_crops',
        crop_stages: 'n_crop_stages'
      }

      for (const collection in newTables) {
        calendar.write(
          (collection === 'municipalities')
            ? calendar[collection].map(x => ({ id: x.id, province: x.province, label: x.name }))
            : calendar[collection],
          path.join(scriptPath, `${newTables[collection]}.csv`))

        console.log(`${collection}: ${calendar[collection].length}`)
      }
    }

    return {
      calendar: calendarData ?? calendar.data(),
      calendargroup: calendarData
        ? null
        : calendar.groupByProvince(),
      forecast,
      missing
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = {
  calendarinit,
  WEATHER_DATASOURCE
}
