const SeasonalForecast = require('./seasonalforecast')
const SF = new SeasonalForecast()

const upsertforecast = SF.upsertforecast.bind(SF)
const getforecast = SF.getforecast.bind(SF)
const getforecastregion = SF.getforecastregion.bind(SF)

/**
  * Compute/set the seasonal weather condition based on value
  * With reference from PAGASA's seasonal forecast
  * https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast
  * @param {Number} value - Rainfall % value
  * @param {String} labelFormat - Seasonal weather condition label format to return (allowed values: seasonal, tenday, rainfall_amt)
  *  - seasonal: Returns the seasonal forecast rainfall condition text
  *  - tenday: Returns the 10-day forecast rainfall condition text
  *  - rainfall_amt: Returns the 10-day forecast rainfall amount descriptive text
  * @returns {String} Weather condition label in seasonal or 10-day weather forecast format, or the rainfall amt descriptive text
  */
const getweathercondition = SF.getweathercondition.bind(SF)

module.exports = {
  upsertforecast,
  getforecast,
  getforecastregion,
  getweathercondition
}
