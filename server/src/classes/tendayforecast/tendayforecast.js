const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, WEATHER_CONDITION_LABELS } = require('../../utils/constants')
const { getNowDateString, getRangedMonths, removeDayString } = require('../../utils/date')

class TendayForecast {
  /**
   * Create or update a 10-day weather forecast by province
   * @typedef {Object} param
   * @param {String} id - (Optional) Unique document identifier ID
   * @param {String} region - Region name
   * @param {String} province - Province name
   * @param {Object} municipalities - Contains municipality names as keys. Each "municipality" key contains an Object[] array of 10 items, containing 10-day weather forecast data for the municipality
   * @param {String} user - User uid
   * @returns {String} Firestore document reference
   */
  async upsertforecast_tenday ({ id, region, province, municipalities, user = 'system' }) {
    const docId = id ?? this.createDocumentID(region)

    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
        .doc(region)
        .collection(FIRESTORE_COLLECTIONS.TEN_DAY)
        .doc(province)
        .set({
          id: docId,
          name: province,
          municipalities,
          updated_by: user === 'system' ? 'system' : user.email,
          uid: user === 'system' ? '-' : user.id,
          date_created: admin.firestore.Timestamp.now()
        })
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }

  // Get the full 10-Day weather forecast by province
  async getforecast ({ region, province }) {
    return await db.collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
      .doc(region)
      .collection(FIRESTORE_COLLECTIONS.TEN_DAY)
      .doc(province)
      .get()
  }

  // Get all the 10-Day weather forecast by region
  async getforecastall (region) {
    const collectionpath = `${FIRESTORE_COLLECTIONS.WEATHER_FORECAST}/${region}/${FIRESTORE_COLLECTIONS.TEN_DAY}`
    return await db.collection(collectionpath)
      .get()
      .then((snapshot) =>
        snapshot.docs.map((doc) =>
          doc.data()
        ))
  }

  /**
   * Get a municipality's current day weather forecast from the 10-Day weather forecast data.
   * Includes the 10-day month range starting from the "current" date
   * @param {String} region - Region name
   * @param {String} province - Province name
   * @param {String} municipality - Municipality name
   * @param {Date} date - Current JS Date object
   * @param {Bool} getMonthEnd - Flag to return the "end" month data of the 10-day date range starting from "date"
   * @param {Number} dayNumber - (Optional) Day number (1 - 10) in the 10-day forecast days to get the "current" weather data forecast from.
   *    - If provided, the current day forecast will be retrieved from this date, instead of the `"current date"` or the `"date"` input parameters
   * @returns {Object} Weather forecast information of the current date from the 10-day weather forecast along with
   *    detailed inclusive 10-day months and month-parts (1st_half, 2nd_half)
   */
  async getcurrentdayforecast ({ region, province, municipality, date, getMonthEnd = true, dayNumber }) {
    try {
      const docSnap = await this.getforecast({ region, province })

      // Use the server-side current now-date
      // Note: This date is subject to the server's timezone
      let dateNow = getNowDateString(false)

      if (date) {
        // Use user-supplied date
        const dateWithoutYear = date.toDateString()
        dateNow = dateWithoutYear.substring(0, dateWithoutYear.length - 5)
      }

      if (docSnap.exists) {
        // Get the 10-day weather info for all 10-days
        const days = Object.values(docSnap.data().municipalities[municipality] ?? [])

        if (dayNumber && days.length > 0) {
          dateNow = days[dayNumber - 1].day_format
        }

        // Get the 10-Day weather info for the current day
        // Do not check the day name (i.e., Sun, Mon, Tue) if strict year checking is turned off
        const weatherToday = days.find(item => {
          return (process.env.CHECK_RANGE_YEAR === '1')
            ? item.day_format === dateNow
            : removeDayString(item.day_format) === removeDayString(dateNow)
        })

        if (!weatherToday) {
          return undefined
        }

        // Find the inclusive 10-Day month(s) with details starting from the date range's "start date"
        const dateRangeStart = new Date(weatherToday.date_start.seconds * 1000)
        const months = getRangedMonths(dateRangeStart, getMonthEnd)

        const weatherCondition = Object.values(WEATHER_CONDITION_LABELS)
          .find(condition => condition.tenday === weatherToday.rainfall)

        const currentWeather = {
          province: weatherToday.province,
          municipality: weatherToday.municipality,
          rainfall: weatherToday.rainfall,
          date_start: days[0].date_start.toDate(),
          date_range: weatherToday.date_range,
          date_now_yyyymmdd: new Date().toLocaleDateString('en-GB').split('/').reverse().join(''),
          day_format: weatherToday.day_format,
          condition: weatherCondition.label || '',
          condition_acap: weatherCondition.label_acap,
          format: weatherCondition.sync,
          format_tenday: weatherCondition.tenday,
          months,
          days
        }

        return currentWeather
      } else {
        return undefined
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Generate a Firestore document ID under the this object's Firestore collection
   * @param {String} region Region name
   * @returns {String} Firestore document ID
   */
  createDocumentID (region) {
    const id = db
      .collection(FIRESTORE_COLLECTIONS.WEATHER_FORECAST)
      .doc(region)
      .collection(FIRESTORE_COLLECTIONS.TEN_DAY)
      .doc().id

    return id
  }
}

module.exports = TendayForecast
