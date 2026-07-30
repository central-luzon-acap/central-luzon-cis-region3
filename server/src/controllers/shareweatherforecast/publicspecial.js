const { dayjsUTC } = require('../../utils/dayjs_utc')

const { getcycloneinformation } = require('../../classes/cyclone_advisory')
const { getspecialregionaldoc } = require('../../classes/regionalspecial')
const { FIRESTORE_DOCUMENTS } = require('../../utils/constants')

/**
 * Fetch the current 10-day weather forecast data and format it for sharing with
 * 3rd party collaborators
 */
const publicSpecialWeatherForecast = async (region) => {
  let affectedMunicipalitiesData
  let cycloneData

  try {
    const [cycloneResponse, affectedResponse] = await Promise.all([
      getcycloneinformation(),
      getspecialregionaldoc({
        region,
        documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED
      })
    ])

    // Cyclone data
    if (!cycloneResponse.exists) {
      throw new Error('Cyclone data does not exist')
    }

    // Affected municipalities data data
    if (!affectedResponse.exists) {
      throw new Error('Affected municipalities data does not exist')
    }

    affectedMunicipalitiesData = affectedResponse.data()
    cycloneData = cycloneResponse.data()

    const dateUpdated = cycloneData.date_updated.toDate()
    const dateCreatedAffected = affectedMunicipalitiesData.date_created.toDate()

    delete cycloneData.data.img
    delete cycloneData.data.signal.content
    delete cycloneData.email
    delete cycloneData.updated_by
    delete cycloneData.date_updated

    cycloneData.data.affected = (cycloneData.has_cyclone)
      ? affectedMunicipalitiesData.data
      : []

    return {
      ...cycloneData,
      date_created: dateUpdated.getTime(),
      date_created_str: dayjsUTC(dateUpdated).tz('Singapore').format('YYYY/MM/DD'),
      date_created_affected: dateCreatedAffected.getTime(),
      date_created_affected_str: dayjsUTC(dateCreatedAffected).tz('Singapore').format('YYYY/MM/DD')
    }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = publicSpecialWeatherForecast
