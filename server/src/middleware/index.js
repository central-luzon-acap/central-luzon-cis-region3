const validFirebaseToken = require('./valid-token')
const rejectAccountDisabled = require('./account-disabled')
const isSuperAdmin = require('./superadmin')
const isProtected = require('./protected')
const multipleExcelFiles = require('./multiple-excel')
const singleExcelFile = require('./single-excel')
const singleCSVFile = require('./single-csv')
const {
  validSeasonalProvinceData,
  validSeasonalRegionData
} = require('./valid-seasonal-params')
const { validRegionalSeasonalParams } = require('./valid-seasonal-common')
const { validRegionalTendayParams } = require('./valid-tenday-common')
const { validSpecialWeatherParams } = require('./valid-specialweather-common')
const { validMunicipalities } = require('./valid-municipality')
const { validGeneralRecommendation } = require('./valid-general-recoms')
const { isCollaborator } = require('./collaborator')
const { validHistoricalForecastSeasonal } = require('./valid-historicalweatherforecast/valid-seasonal')
const { validHistoricalForecastTenday } = require('./valid-historicalweatherforecast/valid-tenday')
const { validHistoricalForecastSpecial } = require('./valid-historicalweatherforecast/valid-special')

module.exports = {
  validFirebaseToken,
  rejectAccountDisabled,
  isSuperAdmin,
  isProtected,
  isCollaborator,
  validSeasonalProvinceData,
  validSeasonalRegionData,
  validRegionalSeasonalParams,
  validRegionalTendayParams,
  validSpecialWeatherParams,
  validMunicipalities,
  validGeneralRecommendation,
  validHistoricalForecastSeasonal,
  validHistoricalForecastTenday,
  validHistoricalForecastSpecial,
  multipleExcelFiles,
  singleExcelFile,
  singleCSVFile
}
