require('dotenv').config()
const { calendarinit, WEATHER_DATASOURCE } = require('./calendarinit')
const { uploadToFirestore } = require('../../lib/uploadtofirestore')
const sync = require('./sync')
const {
  FIRESTORE_COLLECTIONS,
  PROVINCE_LIST
} = require('../../../../utils/constants')

const {
  upsertrawmunicipalities,
  upsertformattedmunicipalities,
  upsertmunicipalitiesdiff
} = require('../../../../classes/municipalities')

// Path: /n_cropping_calendar_lite/{province}.data[]
const calendarprocess = async ({
  weathersource = WEATHER_DATASOURCE.LOCAL_FILE,
  calendarfile,
  calendarData, // parsed crop calendar data from external source
  weatherfile,
  upload = true,
  write = false,
  firestoreCollection
}) => {
  try {
    if (!calendarData) {
      console.log('Reading the cropping calendar CSV...')
    } else {
      console.log('[CALENDAR]: Finding mismatching municipality names...')
    }

    // Parse and extract cropping calendar data and
    // find the missing (mismatching) municipality names with the specified 10-day weather forecast municipalities list
    const { missing, calendar, calendargroup, forecast } = await calendarinit({
      weathersource,
      calendarfile,
      calendarData,
      weatherfile,
      provinces: PROVINCE_LIST,
      write
    })

    // Sync the missing crop calendar municipalities with the 10-day weather forecast masterlists
    const { formatdata, rawdata } = sync({
      missmatching: missing,
      formattedforecast: forecast.formatted
    })

    // Upload the calendar and logs data
    if (upload) {
      const query = []
      let logs = ''

      // Upload query and logs

      // Upload calendar data if its read from this script's internal source definitions
      if (!calendarData) {
        for (const province in calendargroup) {
          logs += `${province}: ${calendargroup[province].length} items\n`
          query.push(
            uploadToFirestore(
              FIRESTORE_COLLECTIONS[firestoreCollection],
              province,
              { data: calendargroup[province] }
            )
          )
        }
      } else {
        logs += '[CALENDAR]: Skipping upload; Using parsed crop calendar input data'
      }

      // Upload the calendar and weather forecast municipalities diffs data
      logs += `\n[CALENDAR]: Uploading ${missing.length} mismatching municipality names\n`
      query.push(upsertmunicipalitiesdiff(missing))

      // Upload the cropping-calendar and 10-day weather forecast synced FORMATTED municipalities
      logs +=
        '[CALENDAR]: Uploading calendar and weather forecast synced formatted municipalities\n'
      query.push(upsertformattedmunicipalities(formatdata))

      // Upload the cropping-calendar and 10-day weather forecast synced FORMATTED municipalities
      logs +=
        '[CALENDAR]: Uploading calendar and weather forecast synced raw municipalities'
      query.push(upsertrawmunicipalities(rawdata))

      console.log(logs)
      console.log('[CALENDAR]: Uploading calendar data to Firestore...')

      await Promise.all(query)
      console.log('[CALENDAR]: Upload success!')
      console.log(`[CALENDAR]: Cropping calendar: ${calendar.length}`)
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = calendarprocess
