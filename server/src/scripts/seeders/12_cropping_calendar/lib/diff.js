/**
 * Creates a list of mismatching municipality names from the cropping calendar and PAGASA 10-day weather forecast excel file.
 * Requires Object data from the cropping calendar data (from CSV file or Firestore document) and 1 of PAGASA's 10-day weather forecast EXCEL file data.
 * @param {Object[]} calendar - Cropping calendar data read by the CroppingCalendar class
 * @param {Object[]} forecast - 10-Day weather forecast municipalities list
 * @returns {Object} { missmatching, forecast, calendar, formattedForecast }
 *    - missmatching: {Object[]} All missing municipalities in the cropping calendar and forecast
 *    - forecast: {Object[]} Municipalities 10-day weather forecast data
 *    - calendar: {Object} Municipalities cropping calendar data
 *    - formattedForecast: {Object} 10-day weather forecast data for drop-down menus
 */
const diff = async ({ forecast, calendar }) => {
  try {
    // Find mising municipalities in calendar that are available in forecast
    const missingInForecast = forecast.reduce((list, item) => {
      if (!calendar.find(x => x.province === item.province &&
        x.municipality === item.municipality)
      ) {
        list.push({ ...item, source: 'forecast' })
      }

      return list
    }, [])

    // Find missing municipalities in forecast that are available in calendar
    const missingInCalendar = calendar.reduce((list, item) => {
      if (!forecast.find(x => x.province === item.province &&
        x.municipality === item.municipality)
      ) {
        list.push({
          id: item?.id ?? list.length,
          province: item.province,
          municipality: item.municipality,
          source: 'calendar'
        })
      }

      return list
    }, [])

    const municipalitiesMismatch = [
      ...missingInForecast,
      ...missingInCalendar
    ]

    return {
      missmatching: municipalitiesMismatch,
      forecast
    }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = diff
