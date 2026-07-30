const { dayjsUTC } = require('../../../utils/dayjs_utc')

const { admin, db } = require('../../../utils/db')
const TropicalCyclone = require('../../cyclone_advisory/cyclone')
const { getspecialregionaldoc } = require('../../regionalspecial')
const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS, MONTHS, REGION } = require('../../../utils/constants')

/**
 * Class for managing the archiving, formatting and pre-processing the special (severe cyclone) weather forecast data for public sharing.
 */
class SharedSeasonalWeatherForecast extends TropicalCyclone {
  #LOG_PREFIX = '[ARCHIVE-CYCLONE]:'

  /**
   * Archives the current "active" special weather forecast data with a typhoon signal.
   * This script should run before overwriting the active data set with newly web-scraped cyclone data.
   * @returns
   */
  async archiveSpecialWeatherForecast () {
    try {
      const [forecast, affectedMunicipalities] = await Promise.all([
        this.getcycloneinformation(),
        getspecialregionaldoc({
          region: REGION,
          documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED
        })
      ])

      if (!forecast.exists) {
        throw new Error('Data does not exist')
      }

      // Tropical cyclone data
      const cycloneData = forecast.data()

      // Exit if theres no typhoon
      if (!cycloneData?.has_cyclone ?? false) {
        this.logMessage('No cyclone, exiting...')
        return
      }

      // Affected municipalities data
      const affectedData = (affectedMunicipalities.exists)
        ? affectedMunicipalities.data()
        : null

      // Find unique identifiers
      const year = new Date().getFullYear()
      const { bulletinNo, classification, typhoonName } = this.findUniquIdentifiers(cycloneData?.data?.meta ?? null)

      // Check amd fetch if the archived document exists
      const archivedData = await this.isExistArchivedDocument({ year, typhoonName })

      // Append date_archived fields in the active cyclone data
      const { date_archived, date_archived_str, ts_date_archived } = this.generateArchiveTimestamps()
      cycloneData.date_created_str = this.dateToYYYYMMDD(cycloneData.date_updated.toDate())
      cycloneData.date_archived = date_archived
      cycloneData.date_archived_str = date_archived_str
      cycloneData.ts_date_archived = ts_date_archived

      // Affected municipalities data
      cycloneData.date_updated_affected = (affectedData !== null)
        ? affectedData.date_created
        : admin.firestore.Timestamp.now()

      cycloneData.date_updated_affected_str = dayjsUTC(cycloneData.date_updated_affected.toDate()).tz('Singapore').format('YYYY/MM/DD')

      // Fully replace the affected municipalities data with new data
      cycloneData.data.affected = (affectedData !== null)
        ? [...affectedData.data]
        : []

      if (archivedData.length === 1) {
        // Update existing archived document
        if (!archivedData[0].bulletins.includes(bulletinNo)) {
          this.logMessage(`Inserting new bulletin #${bulletinNo} data to cyclone archive for ${typhoonName} - ${year} on ID [${archivedData[0].id}], ${this.generateTimestamp()}`)

          await this.updateArchivedSpecialForecast({
            archivedData: archivedData[0],
            forecastData: cycloneData,
            bulletinNo
          })

          this.logMessage(`Finished insert-update process on ${this.generateTimestamp()}`)
        } else {
          this.logMessage(`Skipping inserting bulletin #${bulletinNo} for ${typhoonName} - ${year}`)
        }
      } else if (archivedData.length === 0) {
        // Create a new archived document
        this.logMessage(`Creating a new cyclone archive for ${typhoonName} - ${year} on ${this.generateTimestamp()}`)

        await this.createArchivedSpecialForecast(this.ArchivedCycloneForecast({
          year,
          typhoonName,
          classification,
          bulletinNo,
          cycloneData
        }))

        this.logMessage(`Finished creating a new cyclone archive for ${typhoonName} - ${year} on ${this.generateTimestamp()}`)
      } else {
        throw new Error(`Found more than (1) record for ${typhoonName} ${year}`)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Returns a set of archived (formatted) special (severe cylone/typhoon) weather forecast data
   * @typedef {Object} params
   * @param {String} params.id - Unique document ID
   * @param {String} params.year - Year
   * @param {String} params.month - Month code
   * @param {String} params.typhoonName - Typhoon name
   * @param {String} params.date - Date the special weather forecast was saved to database in "YYYY/MM/DD" format.
   * @returns {Object} Archived seasonal weather forecast document
   */
  async getArchivedSpecialForecast ({ id, year, month, typhoonName, date }) {
    try {
      // Reference
      let docRef = db
        .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
        .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
        .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)

      if (id) {
        docRef = docRef.where('id', '==', id)
      }

      // Query by year
      if (year) {
        docRef = docRef.where('year', '==', parseInt(year))
      }

      // Query by month
      if (month) {
        docRef = docRef.where('months', 'array-contains', month)
      }

      // Query by typhoon name
      if (typhoonName) {
        docRef = docRef.where('typhoon_name', '==', typhoonName)
      }

      // Query by date_created
      if (date) {
        docRef = docRef.where('forecast_dates', 'array-contains', date)
      }

      // Fetch, get data
      return await docRef
        .get()
        .then((snap) => snap.docs.map((doc) => doc.data()))
    } catch (err) {
      throw new Error(err.messabe)
    }
  }

  /**
   * Create a new archived special weather forecast document.
   * @param {Object} data - Special weather forecast data with timestamp fields
   * @returns
   */
  async createArchivedSpecialForecast (data) {
    return await db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
      .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)
      .doc(data.id)
      .set(data)
  }

  /**
   * Updates the contents of an archived special (severe cylone/typhoon) weather forecast document
   * @typedef {Object} params
   * @param {String} forecastData - Special weather forecast data
   * @param {String} bulletinNo - Bulletin number
   * @returns {Object} Archived seasonal weather forecast document
   */
  async updateArchivedSpecialForecast ({ archivedData, forecastData, bulletinNo }) {
    // Document reference
    const docRef = db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
      .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)
      .doc(archivedData.id)

    const dateCreated = dayjsUTC(forecastData.date_updated.toDate()).tz('Singapore').format('YYYY/MM/DD')
    const monthCode = this.getMonthCode(dateCreated)
    const queryUpdates = []

    // Insert new month code
    if (!archivedData.months.includes(monthCode)) {
      queryUpdates.push(docRef.update({
        months: [...archivedData.months, monthCode]
      }))
    }

    // Insert new date_updated value
    if (!archivedData.forecast_dates.includes(dateCreated)) {
      queryUpdates.push(docRef.update({
        forecast_dates: [...archivedData.forecast_dates, dateCreated]
      }))
    }

    // Update the rest of the data
    queryUpdates.push(docRef.update({
      data: [...archivedData.data, forecastData],
      bulletins: [...archivedData.bulletins, bulletinNo],
      date_updated: admin.firestore.Timestamp.now()
    }))

    return await Promise.all(queryUpdates)
  }

  /**
   * Checks if an archived special weather forcast exists by fetching its typhoon_name and year.
   * Also returns the fetched document if it exists.
   * This expects to return only (1) one document in an Object[]. Check for bugs if this returns more than (1) document.
   * @param {String} year - Year
   * @param {String} typhoonName - Typhoon name
   * @returns {Object} Firestore document array
   */
  async isExistArchivedDocument ({ year, typhoonName }) {
    try {
      return await this.getArchivedSpecialForecast({ year, typhoonName })
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Fetches the archived special weather data by the "forcast_dates[]" field.
   * Returns transformed and filtered results to include only the specified "data[]" items with the specified "date" in the "date_created_str" field.
   * @param {String} date - Date in "YYYY/MM/DD" string format.
   * @returns {Object[]} Firestore documents
   */
  async queryGetSpecialArchivesByDate (date) {
    try {
      const archiveData = await this.getArchivedSpecialForecast({ date })

      return archiveData.reduce((list, item, index) => ([
        ...list,
        ...item.data.filter(x => x.date_created_str === date)
      ]), [])
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Fetches the archived special weather data by the "month" and "year" field.
   * Returns transformed and filtered results to include only the specified "data[]" items with the specified "month" and "year".
   * @typedef {Object} params
   * @param {String} params.month - Month code
   * @param {Number} params.year - Year
   * @returns {Object[]} Firestore documents
   */
  async queryGetSpecialArchivesByMonthYear ({ month, year }) {
    try {
      const archiveData = await this.getArchivedSpecialForecast({ month, year })

      return archiveData.reduce((list, item, index) => ([
        ...list,
        ...item.data.filter(x => {
          const date = new Date(x.date_created_str)
          const mCode = this.getMonthCode(x.date_created_str)

          if (date.getFullYear() === parseInt(year) && mCode === month) {
            return true
          } else {
            return false
          }
        })
      ]), [])
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extracts the bulletin number from a text string
   * @param {String} bulletinText - String containing a 2-digit number
   * @returns
   */
  getBulletinNumber (bulletinText) {
    const bulletinNum = bulletinText.match(/\d+/g)

    if (bulletinNum === null) {
      throw new Error('Cannot find the bulletin no.')
    }

    return bulletinNum[0]
  }

  /**
   *  Extracts the typhoon classification and typhoon name from a string of text.
   * @param {String} typhoonName - String containing the typhoon classification/type and name
   * @returns {Object} { classification, name }
   */
  getTyphoonName (typhoonName) {
    const cleanTyphoonName = typhoonName.replace(/"/g, '')
    const names = cleanTyphoonName.split(' ')

    const classification = names.reduce((text, item, index) => {
      if (index < names.length - 1) {
        text += `${item} `
      }

      return text
    }, '')

    return {
      classification: classification.trim(),
      name: names[names.length - 1].trim()
    }
  }

  /**
   * Find the unique identifiers of a special weather forecast data
   * @typedef {Object} meta
   * @param {String} meta.typhoon_name Full, - unprocessed typhoon name
   * @param {String} meta.bulletin_number - Text containing the bulletin number
   * @returns {Object}
   *  - bulletinNo: {Number} - Bulletin number
   *  - classification: {String} -Typhoon classification type
   *  - typhoonName: {String} - Just the typhoon name
   *  - yearNow: {Number} - The current year
   */
  findUniquIdentifiers ({ typhoon_name, bulletin_number }) {
    try {
      // Find unique identifiers
      const bulletinNo = this.getBulletinNumber(bulletin_number ?? '')
      const { classification, name: typhoonName } = this.getTyphoonName(typhoon_name ?? '')
      const yearNow = new Date().getFullYear()

      return {
        bulletinNo: parseInt(bulletinNo),
        classification,
        typhoonName,
        yearNow
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Write a message using console.log() with a prefix.
   * @param {String} message - Any string message
   */
  logMessage (message) {
    console.log(`${this.#LOG_PREFIX} ${message}`)
  }

  /**
   * Generate a string date with hours, minutes and seconds for logging.
   * @returns {String}
   */
  generateTimestamp () {
    return dayjsUTC().tz('Singapore').format('ddd YYYY/MM/DD hh:mm:ss A')
  }

  /**
   * Generate Firestore timestamps and regular YYYY/MM/DD date format for the "date_archived" keys
   * @returns {Object}
   */
  generateArchiveTimestamps () {
    const tsNow = admin.firestore.Timestamp.now()

    return {
      date_archived: tsNow.toDate(),
      date_archived_str: dayjsUTC(tsNow.toDate()).tz('Singapore').format('YYYY/MM/DD'),
      ts_date_archived: tsNow
    }
  }

  /**
   * Converts a Date object to "YYYY/MM/DD" string format.
   * @param {Date} date - JavaScript date object
   * @returns
   */
  dateToYYYYMMDD (date) {
    return dayjsUTC(date).tz('Singapore').format('YYYY/MM/DD')
  }

  /**
   * Retrieves the month code from a date string in "YYYY/MM/DD" format.
   * @param {String} dateStr - Date string in "YYYY/MM/DD" format
   * @returns {String}
   *  - i.e., aug, sept, nov
   */
  getMonthCode (dateStr) {
    const date = new Date(dateStr)
    return Object.keys(MONTHS)[date.getMonth()]
  }

  ArchivedCycloneForecast ({ year, typhoonName, classification, bulletinNo, cycloneData }) {
    const dateUpdatedStr = dayjsUTC(cycloneData.date_updated.toDate()).tz('Singapore').format('YYYY/MM/DD')
    const monthCode = this.getMonthCode(dateUpdatedStr)

    return {
      id: this.generateDocId(),
      year,
      typhoon_name: typhoonName,
      full_name: `${classification} ${typhoonName}`,
      classification,
      bulletins: [parseInt(bulletinNo)],
      forecast_dates: [dateUpdatedStr],
      months: [monthCode],
      data: [cycloneData],
      date_updated: admin.firestore.Timestamp.now()
    }
  }

  /**
   * Generate a random document ID
   */
  generateDocId () {
    return db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
      .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)
      .doc().id
  }

  /**
   * Updates the affected municipalities data of an archived typhoon bulletin sub-item by its "bulletin_no" from a specific "year" and "typhoon_name" document.
   * @param {Object[]} affectedData - Object[] list of typhoon-affected municipalities
   * @returns {Promise}
   */
  async archiveAffectedMunicipalities (affectedData) {
    try {
      // Fetch the latest cyclone data
      const forecast = await this.getcycloneinformation()

      if (!forecast.exists) {
        this.logMessage('Special weather forecast data does not exist')
        return
      }

      // Tropical cyclone data
      const cycloneData = forecast.data()

      // Exit if theres no typhoon
      if (!cycloneData?.has_cyclone ?? false) {
        this.logMessage('No cyclone, exiting...')
        return
      }

      // Find unique identifiers
      const year = new Date().getFullYear()
      const { bulletinNo, typhoonName } = this.findUniquIdentifiers(cycloneData?.data?.meta ?? null)

      const archivedData = await this.isExistArchivedDocument({ year, typhoonName })

      if (archivedData.length === 1) {
        // Document reference
        const docRef = db
          .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
          .doc(FIRESTORE_COLLECTIONS.SPECIAL_WEATHER)
          .collection(FIRESTORE_DOCUMENTS.ARCHIVES.LIST)
          .doc(archivedData[0].id)

        // Sub-item data[] index by bulletin no.
        const subIndex = archivedData[0].data.findIndex(x => {
          const bulletin = this.getBulletinNumber(x.data.meta.bulletin_number)
          return (parseInt(bulletin) === bulletinNo)
        })

        if (subIndex >= 0) {
          this.logMessage(`Updating doc [${archivedData[0].id}] ${typhoonName} - bulletin #${bulletinNo} data, subItem #${subIndex}, ${this.generateTimestamp()}`)

          const dateUpdated = admin.firestore.Timestamp.now()
          archivedData[0].data[subIndex].data.affected = affectedData

          return await docRef.update({
            data: [...archivedData[0].data],
            date_updated_affected: dateUpdated,
            date_updated_affected_str: dayjsUTC(dateUpdated.toDate()).tz('Singapore').format('YYYY/MM/DD')
          })
        } else {
          this.logMessage(`No subitem found for doc [${archivedData[0].id}] ${typhoonName} - bulletin #${bulletinNo}`)
          return
        }
      } else {
        this.logMessage('No archived special weather forecast to update.')
        return
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = SharedSeasonalWeatherForecast
