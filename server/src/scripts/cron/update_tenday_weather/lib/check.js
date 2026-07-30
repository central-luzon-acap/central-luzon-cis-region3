const { isExistArchive } = require('../../../../classes/sharedweatherforecast/tenday')
const { PROVINCE_LIST } = require('../../../../utils/constants')

/**
 * Checks if all province's 10-day weather forecast data under a "{province}.date_created_str" Document name exists by
 * checking each province's "date_created_str" field.
 * @param {Object[]} simpleResponseData - Simplified 10-day weather forecast data per province containing only the "province" and "date_created_str" fields.
 * @returns {Object}
 *    - exists {Bool} All provinces 10-day weather forecast data with the "date_created_str" field does not exist in the archives
 *    - message {String} Archiving message log that displays if 1 or more provinces with "date_created_str" field already exist in the archives
 */
const isTendayArchiveExists = async (simpleResponseData) => {
  try {
    const isExistQueries = []

    // Batch-check if all provinces archived data does not exist
    simpleResponseData.forEach(record => {
      isExistQueries.push(isExistArchive(record.province, record.date_created_str))
    })

    const responseExists = await Promise.all(isExistQueries)

    let existsProvinces = responseExists.reduce((list, exists, index) => {
      list += (exists) ? `${PROVINCE_LIST[index]}, ` : ''
      return list
    }, '')

    const numExists = responseExists.filter(flag => (flag === true))

    // Exit if one or more provinces contains a record with a "date_created_str" field
    // equal to the requested record's "date_created_str" field
    if (numExists.length > 0) {
      let provincesLabel = ''

      if (numExists.length > 1) {
        existsProvinces = existsProvinces.substring(0, existsProvinces.length - 2)
        provincesLabel = 'the provinces '
      }

      return {
        exists: true,
        message: `Found 10-day weather forecast archive for ${provincesLabel}${existsProvinces} on date ${simpleResponseData[0].date_created_str}.`
      }
    } else {
      return {
        exists: false,
        message: `10-day weather forecast archive for date ${simpleResponseData[0].date_created_str} does not exist.`
      }
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = isTendayArchiveExists
