const { dayjsUTC } = require('../../../utils/dayjs_utc')

const { admin, db } = require('../../../utils/db')
const { TendayForecast } = require('../../tendayforecast')
const { FIRESTORE_COLLECTIONS, WEATHER_CONDITION_LABELS } = require('../../../utils/constants')
const encodeToList = require('../../../scripts/tools/archivescleaner/lib/encodelist')

const {
  getErrorLogById,
  LOG_OBJECTS,
  LOG_CATEGORIES
} = require('../../errorlog')

const DATA_TYPE = {
  REGULAR: 'regular',
  ERROR: 'error'
}

class SharedTendayWeatherForecast extends TendayForecast {
  /**
   * Creates the 10-day weather forecast data for sharing in the shared API - a formatted 10-day weather forecast data or an error object.
   * in the /weather_forecasts_api/{province}/{docId} document.
   * Assumes ErrorLogItem.createLog() is run prior to calling this function if params.type=DATA_TYPE.ERROR
   * @typedef {Object} params
   * @param {String} params.region - Region name
   * @param {String} params.province - Province name
   * @param {Bool} params.showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
   * @param {String} params.type - 10-day weather forecast document type
   *  - type=DATA_TYPE.REGULAR: Stores the latest (legit) stored 10-day weather forecast data in the 10-day forecast sharing API.
   *  - type=DATA_TYPE.ERROR: Assumes ErrorLogItem.createLog() is run prior to calling this function. Stores the latest "ErrorLogItem" in the 10-day forecast sharing API.
   */
  async upsertsharedforecast_tenday ({ region, province, type = DATA_TYPE.REGULAR, showDateCreatedTS = false }) {
    let data

    if (!Object.values(DATA_TYPE).includes(type)) {
      throw new Error('Unsupported type')
    }

    try {
      if (type === DATA_TYPE.REGULAR) {
        // Store the latest (legit) stored 10-day weather forecast data
        const response = await this.getforecast({ region, province })

        if (!response.exists) {
          throw new Error('Data does not exist')
        }

        data = this.formattendayforecast({
          province,
          tendayData: response.data(),
          showDateCreatedTS
        })
      }

      if (type === DATA_TYPE.ERROR) {
        // Store the latest "current" error log info
        const dateNow = dayjsUTC().tz('Singapore').format('YYYY-MM-DD')

        const errorLog = await getErrorLogById({
          type: LOG_OBJECTS.CRON,
          category: LOG_CATEGORIES[LOG_OBJECTS.CRON].TENDAY,
          docId: dateNow
        })

        if (errorLog.exists) {
          data = this.formattendayforecasterror({
            region,
            province,
            errorLog: errorLog.data(),
            showDateCreatedTS
          })
        }
      }
    } catch (err) {
      throw new Error(err.message)
    }

    if (!data) {
      throw new Error('Empty data')
    }

    try {
      return await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_API)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.TEN_DAY)
        .doc(province)
        .set(data)
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Returns the formatted version of the latest (stored, legit) 10-day weather forecast data for a province for sharing with the shared API.
   * Returns the latest stored data regardless if there are errors in the ErrorLog documents.
   * @typedef {Object} parameters
   * @param {String} parameters.region - Region name
   * @param {String} parameters.province - Province name
   * @param {Bool} showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
   * @returns {Object} Formatted 10-day weather forecast data for a province
   */
  async getlatesttendayforecast ({ region, province, showDateCreatedTS = false }) {
    try {
      const response = await this.getforecast({
        region,
        province
      })

      if (!response.exists) {
        throw new Error('Data does not exist')
      }

      return this.formattendayforecast(province, response.data(), showDateCreatedTS)
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Returns a the 10-day weather forecast data of a province for sharing with the weather forecast API.
   * This returns a static copy of a 10-day weather forecast data or an ErrorLog document.
   * @typedef {Object} params
   * @param {String} region - Region name
   * @param {String} province - Province name
   * @param {Bool} showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
   * @param {Bool} minimalError - Flag to remove the misc fields of the error response object. Defaults to "false".
   * @returns {Object} Formatted 10-day weather forecast data for a province
   */
  async getsharedtendayforecast ({ region, province, showDateCreatedTS = false, minimalError = false }) {
    try {
      const response = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_API)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.TEN_DAY)
        .doc(province)
        .get()

      if (!response.exists) {
        throw new Error('Data does not exist')
      }

      const data = response.data()

      // Remove the ts_date_created key
      if (!showDateCreatedTS) {
        delete data.ts_date_created
      }

      // Remove misc data from the error response object
      if (minimalError && data.error) {
        delete data.error.level
        delete data.error.type
        delete data.error.category
        delete data.error.date_created
        delete data.error.date_created_str
      }

      return data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Returns a province's archived formatted 10-day weather forecast data by the "date_created_str" field.
   * @typedef {Object} parameter
   * @param {String} parameter.id - Unique document identifier ID
   * @param {String} parameter.province - Province name
   * @param {String} parameter.dateCreatedStr - Date the archived 10-day weather forecast was uploaded to DB ("date_created_str") in YYYY/MM/DD format.
   * @returns {Object[]} Firestore documents
   */
  async getarchivedtendayforecast ({ id, province, dateCreatedStr = [], dateCreatedRange = [] }) {
    try {
      // Reference
      let docRef = db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
        .doc(FIRESTORE_COLLECTIONS.TEN_DAY)
        .collection(province)

      if (dateCreatedStr.length === 0 && dateCreatedRange.length === 0 && !id) {
        throw new Error('No specified date(s) or ID to select.')
      }

      // Query by document ID
      if (id) {
        docRef = docRef.where('id', '==', id)
      }

      // Query by date_created[]
      if (dateCreatedStr.length > 0) {
        docRef = docRef.where('date_created_str', 'in', dateCreatedStr)
      }

      // Query by date_created_range[]
      if (dateCreatedRange.length > 0) {
        const start = admin.firestore.Timestamp.fromDate(new Date(dateCreatedRange[0]))
        const end = admin.firestore.Timestamp.fromDate(new Date(dayjsUTC(dateCreatedRange[1]).add(1, 'day')))

        docRef = docRef.where('ts_date_created', '>=', start)
        docRef = docRef.where('ts_date_created', '<', end)
      }

      // Fetch, get data, delete/format data
      return await docRef
        .get()
        .then((snap) => snap.docs.map((doc) => doc.data()))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Checks if an archived 10-day weather forcast data with the given "date_created_str" param exists
   * @param {String} province - Province name
   * @param {String} dateCreatedStr - Date the archived 10-day weather forecast data was created in "YYYY/MM/DD" string format
   * @returns {Bool} true|false
   */
  async isExistArchive (province, dateCreatedStr) {
    let archivesRef = db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
      .doc(FIRESTORE_COLLECTIONS.TEN_DAY)
      .collection(province)

    try {
      archivesRef = archivesRef.where('date_created_str', '==', dateCreatedStr)
      const snapshot = await archivesRef.get()
      return !snapshot.empty
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Extract the  'YYYY/MM/DD' Date string in a string like '06/14/2023 @8AM'
   * @param {String} dateOfForecastString
   * @returns 'YYYY/MM/DD' Date string
   */
  getYYYYMMDDfromDateForecast = (dateOfForecastString) => {
    return dateOfForecastString.substring(0, 10)
  }

  /**
   * Formats ACAP's 10-day weather forecast data for sharing with 3rd party collaborators
   * @typedef {Object} params - Input parameters
   * @param {String} province - Province name
   * @param {Object} tendayData - Original 10-day weather forecast data retrieved from "TendayForecast.getforecast"
   * @param {Bool} showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
   * @returns {Object} Formatted 10-day weather forecast data
   */
  formattendayforecast ({ province, tendayData, showDateCreatedTS = false }) {
    try {
      const municipalityList = Object.keys(tendayData.municipalities)
      const sampleDay = tendayData.municipalities[municipalityList[0]][0]

      const dateCreated = tendayData.date_created.toDate()
      const TEN_COUNT_INCLUSIVE = 10 - 1

      const zoneDateStart = dayjsUTC(sampleDay.date_start.toDate()).tz('Singapore')
      const zonedDateEnd = dayjsUTC(zoneDateStart).add(TEN_COUNT_INCLUSIVE, 'day').tz('Singapore')

      // 10-day weather condition data, labels and other info
      const tendayConditionData = Object.values(WEATHER_CONDITION_LABELS)

      // Format all municipality date_start to string date in YYYY/MM/DD format
      municipalityList.forEach((municipality) => {
        tendayData.municipalities[municipality] = tendayData.municipalities[municipality].map((item) => {
          return {
            province: item?.province ?? '',
            municipality: item?.municipality ?? '',
            day: item?.day ?? '',
            day_format: item?.day_format ?? '',
            day_str: item?.day_str ?? '',
            rainfall: item?.rainfall ?? '',
            rainfall_amt_text: tendayConditionData.find(x => x.tenday === item.rainfall)?.rainfall_amt_text ?? '',
            cover: item?.cover ?? '',
            humidity: item?.humidity ?? '',
            tmin: item?.tmin ?? '',
            tmax: item?.tmax ?? '',
            tmean: item?.tmean ?? '',
            wspeed: item?.wspeed ?? '',
            wdirection: item?.wdirection ?? ''
          }
        })
      })

      const obj = {
        id: tendayData?.id ?? '-',
        region: process.env.REGION_NAME,
        province,
        municipalities: tendayData.municipalities,
        error: null,
        date_range: sampleDay.date_range,
        date_forecast: sampleDay.date_forecast,
        date_forecast_str: dayjsUTC(this.getYYYYMMDDfromDateForecast(sampleDay.date_forecast)).format('YYYY/MM/DD'),
        date_start: zoneDateStart.toISOString(),
        date_start_str: dayjsUTC(zoneDateStart).format('YYYY/MM/DD'),
        date_end: zonedDateEnd.toISOString(),
        date_end_str: dayjsUTC(zonedDateEnd).format('YYYY/MM/DD'),
        date_created: dateCreated.getTime(),
        date_created_str: dayjsUTC(dateCreated).tz('Singapore').format('YYYY/MM/DD')
      }

      if (showDateCreatedTS) {
        obj.ts_date_created = tendayData.date_created
      }

      return obj
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Formats an error response to ACAP's 10-day weather forecast data for sharing with 3rd party collaborators
   * @typedef {Object} params - Input parameters
   * @param {String} params.region - Region name
   * @param {String} params.province - Province name
   * @param {Object} params.errorLog - 10-day weather forecast error log information. Error logging depends on the day and time of calling the cron:tenday script.
   * @param {Bool} params.showDateCreatedTS - Flag to include the Firestore timestamp "date_created" in the results. Defaults to "false".
   * @returns {Object} Formatted 10-day weather forecast data
   */
  formattendayforecasterror ({ region, province, errorLog, showDateCreatedTS = false }) {
    try {
      const errorLogs = errorLog?.logs ?? []

      // Firestore date now
      const tsNow = admin.firestore.Timestamp.now()

      // Regular error - get the latest error log
      const error = (errorLogs.length > 0)
        ? errorLogs[errorLogs.length - 1]
        : null

      const obj = {
        id: this.createDocumentID(region),
        region: process.env.REGION_NAME,
        province,
        municipalities: null,
        error,
        date_range: null,
        date_forecast: null,
        date_forecast_str: null,
        date_start: null,
        date_start_str: null,
        date_end: null,
        date_end_str: null,
        date_created: tsNow.toDate().getTime(),
        date_created_str: dayjsUTC(tsNow.toDate()).format('YYYY/MM/DD')
      }

      if (showDateCreatedTS) {
        obj.ts_date_created = error?.date_created ?? null
      }

      return obj
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Store and archive a set of 10-day weather forecast data.
   * @param {String} province - Province name
   * @param {Object} data - 10-day weather forecast data (including all municipalities) for a "date_created" date.
   * @param {Bool} overwriteExisting
   *    - Allow overwriting an existing "YYYY-MM-DD" Document with new data. Defaults to "true".
   *    - If "false", throw an Error if an existing "YYYY-MM-DD" Document is found.
   * @returns {Promise}
   */
  async archivetendayforecast (province, data, overwriteExisting = true) {
    try {
      const dateCreatedKey = data.date_created_str.replace(/\//g, '-')

      const docId = db
        .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
        .doc(FIRESTORE_COLLECTIONS.TEN_DAY)
        .collection(province)
        .doc().id

      if (!overwriteExisting) {
        // Skip archiving if data for the current "date_created_str" exists as a Document
        const exists = await this.isExistArchive(province, data.date_created_str)

        if (exists) {
          throw new Error(`10-day weather forecast archive for ${province} on date ${data.date_created_str} already exists.`, exists)
        }
      }

      // Insert date_archived fields
      const tsNow = admin.firestore.Timestamp.now()
      const dateCreatedStr = dayjsUTC(tsNow.toDate()).format('YYYY/MM/DD')

      // Remove misc data from the error object
      if (data.error) {
        delete data.error.date_created
        delete data.error.date_created_str
      }

      return await Promise.all([
        db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST_ARCHIVES)
          .doc(FIRESTORE_COLLECTIONS.TEN_DAY)
          .collection(province)
          .doc(dateCreatedKey)
          .set({
            id: data?.id ?? docId,
            ts_date_start: (data.date_start !== null)
              ? admin.firestore.Timestamp.fromDate(new Date(data.date_start))
              : null,
            ts_date_end: (data.date_end !== null)
              ? admin.firestore.Timestamp.fromDate(new Date(data.date_end))
              : null,
            ts_date_archived: tsNow,
            date_archived: tsNow.toDate().getTime(),
            date_archived_str: dateCreatedStr,
            ...data
          }),
        encodeToList({
          documentId: dateCreatedKey,
          province
        })
      ])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = {
  SharedTendayWeatherForecast,
  DATA_TYPE
}
