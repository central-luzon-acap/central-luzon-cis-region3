const { dayjsUTC } = require('../../../utils/dayjs_utc')
const { findSeasonalMonthsIncludesTargetMonth } = require('../lib/utils')

const { admin, db } = require('../../../utils/db')
const SeasonalForecast = require('../../seasonalforecast/seasonalforecast')
const encodeToList = require('../../../scripts/tools/archivescleaner/lib/encodelist')
const { FIRESTORE_COLLECTIONS, MONTHS } = require('../../../utils/constants')

const buildArchivedDocName = (startMonth, year) => {
  if (year === null || startMonth === null) {
    throw new Error('Invalid seasonal month or year.')
  }

  const mo = Object.keys(MONTHS).findIndex(x => x === startMonth) + 1
  const startMonthNo = (mo < 10) ? `0${mo}` : mo
  return `${year}-${startMonthNo}`
}

/**
 * Class for managing the archiving, formatting and pre-processing the seasonal weather forecast data for public sharing.
 */
class SharedSeasonalWeatherForecast extends SeasonalForecast {
  #LOG_PREFIX = '[ARCHIVE-SEASONAL]:'

  /**
   * Archives the current "active" seasonal weather forecast data.
   * Store and archive a set of (6) six seasonal months weather forecast data in a logs[] array of a "{yyyy}-{dd}" document name, where
   *    "{yyyy}-{dd}" corresponds to the 1st seasonal month of the data set.
   * This script should run before Administrators upload a new set of PAGASA seasonal weather forecast Excel file.
   * @typedef {Object} params
   * @param {String} region - Region name
   * @param {String} province - Province name
   */
  async archiveseasonalforecast (region, seasonalData = []) {
    try {
      let forecast

      if (seasonalData.length > 0) {
        forecast = [...seasonalData]
      } else {
        // Fetch the active weather forecast data
        forecast = await this.getforecastregion(region)
      }

      if (forecast.length === 0) {
        this.logMessage('Data does not exist. Skipping archiving.')
        return
      }

      // Build the doc name {year}_{month}
      const startMonth = forecast[0]?.months[0]?.mo ?? null
      const year = forecast[0]?.months[0]?.year ?? null
      const docName = buildArchivedDocName(startMonth, year)

      // Fetch archived documents by {yyyy}-{mm} doc name for updating
      const queryArchived = []
      const queryUpdate = []

      for (let i = 0; i < forecast.length; i += 1) {
        queryArchived.push(this.checkExistsAndFetch(forecast[i].name, docName))
      }

      this.logMessage(`Fetching archived data for [${docName}], started on ${dayjsUTC().format('YYYY/MM/DD')}`)
      const archivedData = await Promise.all(queryArchived)

      // Insert the active seasonal weather forecast in existing documents or create new ones
      for (let i = 0; i < archivedData.length; i += 1) {
        if (archivedData[i].exists) {
          // Insert into the logs[] field of an existing archived seasonal weather forecast document
          const tempData = archivedData[i].data()

          // Document reference
          const docRef = db
            .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
            .doc(FIRESTORE_COLLECTIONS.SEASONAL)
            .collection(tempData.province)
            .doc(tempData.doc_name)

          queryUpdate.push(docRef.update({
            data: [...tempData.data, this.formatSeasonalForecast(forecast[i], true)]
          }))

          this.logMessage(`${tempData.province} - Updating the archived seasonal doc on month start ${tempData.doc_name}`)
        } else {
          // Create a new archived seasonal weather forecast document
          const newArchiveDoc = this.ArchivedSeasonalForecast({
            region,
            province: forecast[i].name,
            month: startMonth,
            docName,
            year
          })

          newArchiveDoc.data.push(this.formatSeasonalForecast(forecast[i], true))
          queryUpdate.push(this.createArchivedSeasonalForecast(newArchiveDoc))

          // Encode the new document ID to the list tracker
          queryUpdate.push(encodeToList(({
            documentId: newArchiveDoc.doc_name,
            province: forecast[i].name,
            type: 'seasonal'
          })))

          this.logMessage(`"Creating" a new archived seasonal doc for [${forecast[i].name}] on month start ${startMonth}`)
        }
      }

      await Promise.all(queryUpdate)
      const lastMoIndex = forecast[0].mos.length - 1

      this.logMessage(`Finished archiving seasonal months [${startMonth} - ${forecast[0].mos[lastMoIndex]} ${year}] on ${dayjsUTC().format('YYYY/MM/DD')}`)
      return
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Checks if an archived seasonal weather exists by its fetching from {YYYY}-{MM} document name.
   * @param {String} province
   * @param {String} docName
   * @returns {Object} Firestore document reference
   */
  async checkExistsAndFetch (province, docName) {
    return await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SEASONAL)
      .collection(province)
      .doc(docName)
      .get()
  }

  /**
   * Generate a random document ID
   * @param {String} province - Province name
   * @returns
   */
  generateDocId (province) {
    return db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SEASONAL)
      .collection(province)
      .doc().id
  }

  /**
   * Write a message using console.log() with a prefix.
   * @param {String} message - Any string message
   */
  logMessage (message) {
    console.log(`${this.#LOG_PREFIX} ${message}`)
  }

  /**
   * Create a new archived seasonal weather forecast document.
   * @param {Object} data - Seasonal weather forecast data with timestamp fields
   * @returns
   */
  async createArchivedSeasonalForecast (data) {
    return await db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.SEASONAL)
      .collection(data.province)
      .doc(data.doc_name)
      .set(data)
  }

  /**
   * Returns an archived (formatted) seasonal weather forecast data
   * @typedef {Object} params
   * @param {String} id - Unique document ID
   * @param {String} province - Province name
   * @param {String} month_start - Month code of the (6) six seasonal month's 1st (starting) month
   * @param {String} year - Year
   * @returns {Object} Archived seasonal weather forecast document
   */
  async getArchivedSeasonalForecast ({ id, province, month_start, year }) {
    try {
      // Reference
      let docRef = db
        .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
        .doc(FIRESTORE_COLLECTIONS.SEASONAL)
        .collection(province)

      if (id) {
        docRef = docRef.where('id', '==', id)
      }

      // Query by year
      if (year) {
        docRef = docRef.where('year', '==', parseInt(year))
      }

      // Query by month
      if (month_start) {
        docRef = docRef.where('month', '==', month_start)
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
   * Returns the archived seasonal forecasts of a specified month and year, as recorded in the past (5) months and target month (1).
   * Returns a max total of (6) months containing only the target month's seasonal data. Non-existent months are omitted from the results.
   * @typedef {Object} params
   * @param {String} province - Province name
   * @param {String} month - Month code
   * @param {Number} year - Year
   * @returns {Object}
   */
  async getArchivedSeasonalForecastFull ({ month, year, province }) {
    try {
      const fullMonths = findSeasonalMonthsIncludesTargetMonth(month, year)

      // Fetch seasonal monthly archives only up to the specified month
      const months = fullMonths.slice(0, fullMonths.findIndex(x => x.month === month) + 1)
      const queries = []

      months.slice(0, months.findIndex(x => x.month === month) + 1).forEach((item) => {
        queries.push(this.getArchivedSeasonalForecast({
          province,
          month_start: item.month,
          year: item.year
        }))
      })

      const seasonalArchiveWithTargetMonth = await Promise.all(queries)

      return {
        province,
        month,
        year,
        forecast: seasonalArchiveWithTargetMonth.reduce((list, seasonalData) => {
          if (seasonalData.length > 0) {
            list[seasonalData[0].month] = seasonalData[0].data.map((item, id) => {
              const monthForecast = item.months.find(x => x.mo === month)
              const archiveDateFormat = dayjsUTC(item.date_archived.toDate()).tz('Singapore').format('ddd YYYY/MM/DD hh:mm:ss A')

              return {
                id,
                info: `${month.toUpperCase()} ${year} seasonal forecast extracted from the (6) months ${item.mos[0].toUpperCase()} - ${item.mos[item.mos.length - 1].toUpperCase()} ${year} seasonal forecast data set archived on ${archiveDateFormat}`,
                date_created_str: item.date_created_str,
                date_archived_str: item.date_archived_str,
                ts_date_archived: item.date_archived.toDate(),
                year: monthForecast?.year ?? null,
                months_year: item.months_year,
                condition: monthForecast?.condition ?? null,
                condition_label_tenday: monthForecast?.condition_label_tenday ?? null,
                rainfall: monthForecast?.rainfall ?? null,
                rainfall_amt_text: monthForecast?.rainfall_amt_text ?? null
              }
            })
          }

          return { ...list }
        }, {})
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Constructs an archived seasonal weather forecast document structure
   * @typedef {Object} params
   * @param {String} region - Region name
   * @param {String} province - Province name
   * @param {String} month - Month code
   * @param {String} monthNum - Month index (0 - 11)
   * @param {String} year - Year
   * @returns
   */
  ArchivedSeasonalForecast ({ region, province, month, docName, year }) {
    return {
      id: this.generateDocId(province),
      region,
      province,
      month,
      year,
      doc_name: docName,
      data: []
    }
  }

  /**
   * Format the seasonal weather forecast data for sharing with 3rd party collaborators.
   * @param {Object} seasonalData - Seasonal weather forecast data.
   * @param {Bool} showArchivedTs - Include Firebase timestamps in the response object.
   * @returns
   */
  formatSeasonalForecast (seasonalData, showArchivedTs = false) {
    try {
      const tsNow = admin.firestore.Timestamp.now()
      const dateCreated = (typeof seasonalData.date_created === 'object')
        ? seasonalData.date_created.toDate()
        : new Date(seasonalData.date_created)

      const obj = {
        region: process.env.REGION_NAME,
        province: seasonalData.name,
        mos: seasonalData.mos,
        months_year: seasonalData.months.reduce((string, item, index) => {
          const suffix = (index < seasonalData.months.length - 1) ? '|' : ''
          const month = `${item.mo}_${item.year}` + suffix
          string += month
          return string
        }, ''),
        months: seasonalData.months.reduce((list, item) => {
          const obj = {
            /** Weather condition label (seasonal) */
            condition: item.con,
            /** Weather condition label (10-day) */
            condition_label_tenday: this.getweathercondition(item.val, 'tenday'),
            /** (6) seasonal months code list */
            mo: item.mo,
            /** Current year associated with the month */
            year: item.year,
            /** Mean of min/max rainfall */
            mean: item.mean,
            /** %N forecast rainfall value (table with colorful cells) */
            rainfall: (item.val) ? parseFloat(item.val) : null,
            /** Descriptive text rainfall amount */
            rainfall_amt_text: this.getweathercondition(item.val, 'rainfall_amt'),
            /** Normal rainfall value 1991-2020 */
            normal: (item.normal) ? parseFloat(item.normal) : null,
            /** Dry/wet days forecast */
            dry_wet: item.dry
          }

          list.push(obj)
          return list
        }, []),
        date_created: dateCreated.getTime(),
        date_created_str: dayjsUTC(new Date(dateCreated)).tz('Singapore').format('YYYY/MM/DD')
      }

      if (showArchivedTs) {
        obj.date_archived = tsNow.toDate()
        obj.date_archived_str = dayjsUTC(tsNow.toDate()).tz('Singapore').format('YYYY/MM/DD')
        obj.ts_date_archived = tsNow
      }

      return obj
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = SharedSeasonalWeatherForecast
