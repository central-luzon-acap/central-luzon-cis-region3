const {
  MONTHS,
  REGION,
  WEATHER_CONDITION_LABELS,
  FIRESTORE_DOCUMENTS
} = require('../../constants')

const { getforecastregion } = require('../../../classes/seasonalforecast')
const { getseasonalregionaldoc } = require('../../../classes/regionalseasonal')
const { getprovincesinfo } = require('../../../classes/provinces')
const { nullToString } = require('../lib/utils')

/**
 * Load the latest regional seasonal weather forecast data and format it for tabular display
 * @param {String} region - Region name
 * @returns {Object[]} formattedMonths - Array of formatted month names
 *    formattedMonths.formatted - Full month name with year
 *    formattedMonths.code - Abbreviated month name
 *    formattedMonths.cyclones - No. of tropical cyclones
 * @returns {Object[]} tableData - Array of seasonal weather forecast data by province
 *    tableData.code - Province code
 *    tableData.class[] - List of CSS class for cell background and font color arranged in ascending months
 *    tableData.values[] - List of seasonal weather forecast values arranged in ascending months
 * @returns {Object[]} weatherSystems - List of other weather systems that may affect the region
 *    weatherSystems.id - Numeric ID
 *    weatherSystems.value - Weather system name
 */
const seasonalForecastData = async (region = REGION, province) => {
  let formattedMonths = []
  let tableData = []
  let singleTableData = []
  let weatherSystemsList = []

  try {
    // Fetch data
    const [forecast, tropicalCyclones, weatherSystems, provinceInfo] =
      await Promise.all([
        getforecastregion(region),
        getseasonalregionaldoc({
          region,
          documentName: FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT
        }),
        getseasonalregionaldoc({
          region,
          documentName:
            FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.MISC_WEATHER_SYSTEMS
        }),
        getprovincesinfo()
      ])

    const months = forecast[0].mos

    // Format the months headers
    formattedMonths = forecast[0].months.reduce((acc, month) => {
      const monthFormats = {
        formatted: `${MONTHS[month.mo]} ${month.year}`,
        short:
          month.mo[0].toUpperCase() + month.mo.substring(1, month.mo.length)
      }

      acc.push(monthFormats)
      return acc
    }, [])

    const provinceCode = provinceInfo.data[province].code

    const forecastProvince = forecast.find((item) => item.name === province)
    singleTableData = [
      {
        code: provinceCode,
        class: forecastProvince.months.map((item) => item.con),
        values: forecastProvince.months.map((item) => nullToString(item.val)),
        normal: forecastProvince.months.map((item) =>
          nullToString(item.normal)
        ),
        dryforecast: forecastProvince.months.map((item) =>
          nullToString(item.dry)
        ),
        mean: forecastProvince.months.map((item) => nullToString(item.mean))
      }
    ]

    // Format the table data
    tableData = forecast.reduce((acc, province) => {
      const row = {
        code: provinceInfo.data[province.name].code,
        class: months.map((x) => {
          const condition = province.months.find((y) => y.mo === x).con
          return Object.values(WEATHER_CONDITION_LABELS).find(
            (x) => x.label === condition
          ).class
        }),
        // rainfall
        values: months.map((x) =>
          nullToString(province.months.find((y) => y.mo === x).val)
        ),
        // normal rainfall value 1991-2020
        normal: months.map((x) =>
          nullToString(province.months.find((y) => y.mo === x).normal)
        ),
        // dry/wet days forecast
        dryforecast: months.map((x) =>
          nullToString(province.months.find((y) => y.mo === x).dry)
        ),
        // mean of mean/max rainfall
        mean: months.map((x) =>
          nullToString(province.months.find((y) => y.mo === x).mean)
        )
      }

      acc.push(row)
      return acc
    }, [])

    // Process the common seasonal regional weather forecast - no. of tropical cyclones data
    // Include the no. of tropical cyclones for each month in formattedMonths
    if (!tropicalCyclones.exists) {
      throw new Error(new Error('Failed to fetch no. of cyclones data.'))
    } else {
      const numCyclones = tropicalCyclones.data()
      for (let i = 0; i < formattedMonths.length; i += 1) {
        formattedMonths[i].cyclones = numCyclones.data[i].value
      }
    }

    // Process the common seasonal regional weather forecast - misc weather systems
    // Include the no. of tropical cyclones for each month in formattedMonths
    if (!weatherSystems.exists) {
      throw new Error(new Error('Failed to weather systems data.'))
    } else {
      weatherSystemsList = weatherSystems.data().data
    }
  } catch (err) {
    throw new Error(err.message)
  }

  return {
    formattedMonths,
    tableData,
    singleTableData,
    weatherSystemsList
  }
}

module.exports = seasonalForecastData
