const path = require('path')
const calendarprocess = require('../../seeders/12_cropping_calendar/lib/calendarprocess')
const getargs = require('../../../utils/getargs')
const { WEATHER_DATASOURCE } = require('../../seeders/12_cropping_calendar/lib/calendarinit')

const main = async () => {
  try {
    const args = getargs(['localfilename'])

    // Writes output log files to /seeders/12_cropping_calendar
    await calendarprocess({
      weathersource: WEATHER_DATASOURCE.DATABASE,
      calendarfile: path.join(__dirname, args.localfilename),
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

main()
