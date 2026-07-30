const path = require('path')
const calendarprocess = require('./lib/calendarprocess')
const { WEATHER_DATASOURCE } = require('./lib/calendarinit')
const createDefaultCalendarData = require('./lib/defaultcalendardata')

/* eslint-disable no-unused-vars */
const main = async () => {
  const calendarFilePath = path.join(__dirname, 'empty_cropping_calendar.csv')

  try {
    await createDefaultCalendarData(calendarFilePath)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }

  try {
    await calendarprocess({
      weathersource: WEATHER_DATASOURCE.LOCAL_FILE,
      calendarfile: calendarFilePath,
      upload: true,
      write: true,
      firestoreCollection: 'CROPPING_CALENDAR'
    })

    process.exit(0)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

// 20240610: Default calendar data no longer required for ACAP 2.0
// main()
