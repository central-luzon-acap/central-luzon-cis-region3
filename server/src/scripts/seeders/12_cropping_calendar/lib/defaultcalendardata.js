const fs = require('fs')
const path = require('path')
const { getmunicipalitiesreference } = require('../../../../classes/municipalities')
const { ParserCSV } = require('csv-firestore')

/**
 * Generate an empty cropping calendar data to use as the default cropping calendar seeder value
 * using the latest provinces and municipalities defined in the Firestore database.
 * Writes the empty cropping calendar data to a CSV file.
 * @param {String} filepath - Full file path to a CSV file where to write the empty cropping calendar data.
 */
const createDefaultCalendarData = async (filepath) => {
  const CSVWriter = new ParserCSV()

  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    // Create a new empty file for writing
    fs.openSync(filepath, 'w')
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    // Get all municipalities list
    const doc = await getmunicipalitiesreference()

    if (doc.exists) {
      const provinces = doc.data().data
      const data = []

      for (const province in provinces) {
        provinces[province].forEach((municipality) => {
          const obj = {}
          obj.prov = province
          obj.muni = municipality
          obj.crop = 'Rice'

          for (let i = 1; i <= 12; i += 1) {
            const monthPrefix = (i < 10) ? `0${i}` : i
            obj[`${monthPrefix}_15_CAL`] = ''
            obj[`${monthPrefix}_30_CAL`] = ''
          }

          data.push(obj)
        })
      }

      const fileWritePath = (filepath) || path.join(__dirname, '..', 'default_cropping_calendar.csv')

      CSVWriter.write(data, fileWritePath)
      return true
    } else {
      throw new Error('The provinces and municipalities online reference is empty.\nPlease run the 03_forecast_10day or cron:tenday scripts first and try again.')
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = createDefaultCalendarData
