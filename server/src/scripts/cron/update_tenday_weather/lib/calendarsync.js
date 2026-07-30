const { getcropcalendarallV2 } = require('../../../../classes/calendar_v2')
const { diff, sync } = require('../../../seeders/12_cropping_calendar/lib')

const {
  upsertrawmunicipalities,
  upsertformattedmunicipalities,
  upsertmunicipalitiesdiff
} = require('../../../../classes/municipalities')

/**
 * Syncs the 10-day weather forecast "formatted" and "raw" municipalities list with the cropping calendar ExcelAdapter.
 * Fetches the latest cropping calendar data from database.
 * @param {Object} forecastlist - Contains raw and formatted 10-day weather forecast municipalities list, { municipalities, formatted }
 */
const calendarsync = async ({ forecastlist }) => {
  try {
    // Fetch the latest cropping calendar data and
    const calendardata = await getcropcalendarallV2()

    const calendar = calendardata.reduce((list, province) => {
      // Process only the "data1" municipality names of the cropping calendar v2 data
      if (province.data?.data1) {
        return [...list, ...province.data.data1]
      }

      return list
    }, [])

    let logs = ''
    const query = []

    // Find the missing (mismatching) municipality names between the cropping calendar and 10-day weather forecast list
    const {
      missmatching: missing
    } = await diff({ calendar, forecast: forecastlist.municipalities })

    // Sync the missing crop calendar municipalities and the 10-day weather forecast municipalities masterlists
    const { formatdata, rawdata } = sync({
      missmatching: missing,
      formattedforecast: forecastlist.formatted
    })

    // Upload synced municipalities masterlists

    // Upload the calendar and weather forecast municipalities diffs data
    logs += `\n[10-DAY EXCEL]: Uploading ${missing.length} mismatching municipality names\n`
    query.push(upsertmunicipalitiesdiff(missing))

    // Upload the cropping-calendar and 10-day weather forecast synced FORMATTED municipalities
    logs += '[10-DAY EXCEL]: Uploading calendar and weather forecast synced formatted municipalities\n'
    query.push(upsertformattedmunicipalities(formatdata))

    // Upload the cropping-calendar and 10-day weather forecast synced FORMATTED municipalities
    logs += '[10-DAY EXCEL]: Uploading calendar and weather forecast synced raw municipalities'
    query.push(upsertrawmunicipalities(rawdata))

    console.log(logs)
    await Promise.all(query)
    console.log('[10-DAY EXCEL]: Upload success!')
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = calendarsync
