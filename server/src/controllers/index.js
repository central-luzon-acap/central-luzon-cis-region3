const { Router } = require('express')
const router = new Router()
const routerShared = new Router()

const {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  listUsers
} = require('./user')

const {
  upsertForecastProvince,
  upsertForecastRegion,
  upsertForecastExcel,
  updateForecastRegionalSeasonal
} = require('./seasonalforecast')

const { shareWeatherForecast } = require('./shareweatherforecast')

const { historicalWeatherForecast } = require('./historicalweatherforecast')

const {
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
  validHistoricalForecastSeasonal,
  validHistoricalForecastTenday,
  validHistoricalForecastSpecial,
  multipleExcelFiles,
  singleExcelFile
} = require('../middleware')

const { getWeatherToday } = require('./openweather')

const { upsertForecastTen, updateForecastRegionalTenday } = require('./tendayforecast')

const { createReport, deleteReport } = require('./report/seasonal')

const { createTenDReport } = require('./report/tenday')

const { createSpecialSignalReport } = require('./report/specialSignal')

const { sendSmsRecommendations } = require('./text')

const { deleteBulletin } = require('./bulletin')

const {
  updateSpecialTyphoon,
  updateSpecialTyphoonRegional
} = require('./specialtyphoon')

const { createContact, updateContact, deleteContact, viewPhonebook } = require('./phonebook')

const { uploadCroppingCalendarExcel } = require('./croppingCalendar')
const {
  uploadCropRecommendationsExcel
} = require('./recommendations')

// ----------------------------------------
// USERS
// ----------------------------------------

/**
 * @api {post} /user Create Firebase User
 * @apiName createUser
 * @apiGroup User
 * @apiDescription Create a new Firebase Authentication user with given email
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} email User email
 * @apiBody {String} displayname Display name/username
 * @apiBody {Number} account_level account level for custom claims: 1=superadmin, 2=admin
 *
 * @apiSuccess {String} uid Unique Firebase user id
 * @apiSuccess {String} email User email
 * @apiSuccess {String} emailVerified true|false account's email verification status
 * @apiSuccess {String} displayName user's display name/username
 * @apiSuccess {String} disabled true|false account is enabled or disabled
 * @apiSuccess {Object} metadata
 * @apiSuccess {String} metadata.lastSignInTime Date/time the user has last signed-in
 * @apiSuccess {String} metadata.creationTime Date/time the UserRecord was created
 * @apiSuccess {Object} customClaims Custom created user parameters
 * @apiSuccess {Object} customClaims.account_level account type: 1=superadmin, 2=admin
 * @apiSuccess {String} tokensValidAfterTime time remaining for the user's login token validity
 * @apiSuccess {Object[]} providerData Object array of public fields returned by Firebase Authentication's Email/Password Provider
 * @apiSuccess {String} providerData.uid Unique Firebase user id
 * @apiSuccess {String} providerData.displayName user's display name/username
 * @apiSuccess {String} providerData.email User email
 * @apiSuccess {String} providerData.providerId Firebase Authentication Provider type
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     email: 'someonesemail@gmail.com',
 *     displayname: 'Some User',
 *     account_level: 1
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/user', method: 'POST' })
 */
router.post('/user', validFirebaseToken, rejectAccountDisabled, isSuperAdmin, createUser)

/**
 * @api {patch} /user Update UserRecord
 * @apiName updateUser
 * @apiGroup User
 * @apiDescription Update a Firebase Auth User's UserRecord by UID
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} uid Unique Firebase user id
 * @apiBody {String} [email] User email
 * @apiBody {String} [displayname] Display name/username
 * @apiBody {Bool} [disabled] true|false account is enabled or disabled
 * @apiBody {Bool} [emailverified] true|false account's email verification status
 * @apiBody {Number} [account_level] account level for custom claims: 1=superadmin, 2=admin
 *
 * @apiSuccess {Object} UserRecord Firebase UserRecord (see the 200 success result of the `Create Firebase User` endpoint for more information)
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     uid: '85EmjTGiT1cYakDC6VGZ8uaGgZN2',
 *     displayname: 'Juan de la Cruz',
 *     account_level: 2
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: 'http://localhost:3001/api/user', method: 'PATCH' })
 */
router.patch('/user', validFirebaseToken, rejectAccountDisabled, isProtected, updateUser)

/**
 * @api {delete} /user/:uid Delete UserRecord
 * @apiName deleteUser
 * @apiGroup User
 * @apiDescription Delete a Firebase Auth User's UserRecord by UID
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiParam {String} uid Unique Firebase user id
 *
 * @apiSuccess {String} message Log message of successful user deletion.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * await axios.delete('http://localhost:3001/api/user/6uHhmVfPdjb6MR4ad5v9Np38z733', obj)
 */
router.delete('/user/:uid', validFirebaseToken, rejectAccountDisabled, isSuperAdmin, isProtected, deleteUser)

/**
 * @api {get} /user Get UserRecord
 * @apiName getUser
 * @apiGroup User
 * @apiDescription Get user's Firebase Auth UserRecord by user UID or email. Either one of `uid` or `email` should be provided on the GET request.
 *
 * @apiSampleRequest off
 * @apiParam (Request Query) {String} [uid] Unique Firebase user id
 * @apiParam (Request Query) {String} [email] User id
 *
 * @apiSuccess {Object} UserRecord Firebase UserRecord (see the 200 success result of the `Create Firebase User` endpoint for more information)
 *
 * @apiExample {js} Example usage:
 * await axios.get('http://localhost:3001/api/user?uid=85EmjTGiT1cYakDC6VGZ8uaGgZN2')
 * await axios.get('http://localhost:3001/api/user?email=someonesemail@gmail.com')
 */
router.get('/user', getUser)

/**
 * @api {get} /users List UserRecords
 * @apiName getUserList
 * @apiGroup User
 * @apiDescription Get the UserRecord of all Firebase Auth Users
 *
 * @apiSampleRequest off
 *
 * @apiSuccess {Object[]} users[] Array of Firebase UserRecords (see the 200 success result of the `Create Firebase User` endpoint for more information)
 *
 * @apiExample {js} Example usage:
 * await axios.get('http://localhost:3001/api/users')
 */
router.get('/users', listUsers)

// ----------------------------------------
// SEASONAL FORECAST
// ----------------------------------------

/**
 * @api {post} /weather/seasonal/province Upsert Seasonal Forecast by Province
 * @apiName upsertSeasonalProvince
 * @apiGroup WeatherForecast
 * @apiDescription Create a region's Seasonal Weather Forecast for a province f it does not yet exist, or update existing data. Currently supports the Bicol region only.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region=bicol Region name. (Accepts only `bicol` only for now)
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name under the `region`.
 * @apiBody {Object[]} months Array of (6) months seasonal data for the `province`.
 * @apiBody {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} months.mo Month label
 * @apiBody {Number={0...1000}} months.val Rainfall percentage linked to `months.mo` with reference to the PAGASA Rainfall forecast on [https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast](https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast)
 * @apiBody {String='wb_normal','b_normal','near_normal','above_normal'} months.con PAGASA-defined weather condition codes associated with `months.val` (`Way below normal=wb_normal`, `Below normal=b_normal`, `Near normal=near_normal`, `Above normal=above_normal`).
 *
 * @apiSuccess {String} name Saved province name
 * @apiSuccess {String[]} mos Saved month label(s). See `months.mo` for possible values.
 * @apiSuccess {Object[]} months Saved (6) months seasonal data for the `province`.
 * @apiSuccess {String=''jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec''} months.mo Saved month label
 * @apiSuccess {Number={0...1000}} months.val Saved rainfall percentage for `months.mo`
 * @apiSuccess {String='wb_normal','b_normal','near_normal', 'above_normal'} months.con Saved PAGASA-defined weather condition codes associated with `months.val` (`Way below normal=wb_normal`, `Below normal=b_normal`, `Near normal=near_normal`, `Above normal=above_normal`).
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Norte',
 *     months: [
 *       { mo: 'apr', val: '1', con: 'drier' },
 *       { mo: 'may', val: '90', con: 'normal' },
 *       ...
 *       { mo: 'jun', val: '130', con: 'wetter' }
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/weather/seasonal/province', method: 'POST' })
 */
router.post('/weather/seasonal/province', validFirebaseToken, rejectAccountDisabled, validSeasonalProvinceData, upsertForecastProvince)

/**
 * @api {post} /weather/seasonal/region Upsert Seasonal Forecast by Region
 * @apiName upsertSeasonalRegion
 * @apiGroup WeatherForecast
 * @apiDescription Create a region's Seasonal Weather Forecast for all provinces if it does not yet exist, or update existing data. Currently supports the Bicol region only.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region=bicol Region name. (Accepts only `bicol` only for now)
 * @apiBody {Object[]} provinces Array of province seasonal weather forecast data.
 * @apiBody {String} provinces.name Province name
 * @apiBody {Object[]} provinces.months
 * @apiBody {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} months.mo Month label
 * @apiBody {Number={0...1000}} months.val Rainfall percentage linked to `months.mo` with reference to the PAGASA Rainfall forecast on [https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast](https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast)
 * @apiBody {String='wb_normal','b_normal','near_normal','above_normal'} months.con PAGASA-defined weather condition codes associated with `months.val` (`Way below normal=wb_normal`, `Below normal=b_normal`, `Near normal=near_normal`, `Above normal=above_normal`).
 *
 * @apiSuccess {Object[]} provinces Array of saved seasonal weather data per province. See the **WeatherForecast - Upsert Seasonal Forecast by Region** `provinces` **Success 200** response to view the individual item fields information.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'inazuma',
 *     provinces: [
 *       {
 *         name: 'ritou',
 *         months: [
 *           { mo: 'apr', val: '1', con: 'above_normal' },
 *           { mo: 'may', val: '90', con: 'near_normal' },
 *           ...
 *           { mo: 'jun', val: '130', con: 'wb_normal' }
 *         ]
 *       },
 *       {
 *         name: 'narukami',
 *         months: [
 *           { mo: 'apr', val: '4', con: 'above_normal' },
 *           { mo: 'may', val: '115', con: 'b_normal' },
 *           ...
 *           { mo: 'jun', val: '240', con: 'wb_normal' }
 *         ]
 *       },
 *       {
 *         name: 'watatsumi',
 *         months: [
 *           { mo: 'apr', val: '7', con: 'near_normal' },
 *           { mo: 'may', val: '101', con: 'b_normal' },
 *           ...
 *           { mo: 'jun', val: '145', con: 'wb_normal' }
 *         ]
 *       },
 *       ...
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/weather/seasonal/region', method: 'POST' })
 */
router.post('/weather/seasonal/region', validFirebaseToken, rejectAccountDisabled, validSeasonalRegionData, upsertForecastRegion)

/**
 * @api {post} /weather/seasonal/excel Upsert Seasonal Forecast Excel File
 * @apiName upsertForecastExcel
 * @apiGroup WeatherForecast
 * @apiDescription Uploads PAGASA's seasonal weather forecast excel file to create a region's Seasonal Weather Forecast for all provinces if it does not yet exist, or update existing data. Currently supports the Bicol region only.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {FormData={seasonal_data.xlsx}} excelfile PAGASA's seasonal weather forecast excel file
 *
 * @apiSuccess {Object[]} provinces Array of saved seasonal weather data per province. See the **WeatherForecast - Upsert Seasonal Forecast by Region** `provinces` **Success 200** response to view the individual item fields information.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: FormData,
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: http://localhost:3001/api/weather/seasonal/excel, method: 'POST' })
 */
router.post('/weather/seasonal/excel', validFirebaseToken, rejectAccountDisabled, singleExcelFile, upsertForecastExcel)

/**
 * @api {post} /weather/seasonal/province Upsert Seasonal Forecast by Province
 * @apiName upsertSeasonalProvince
 * @apiGroup WeatherForecast
 * @apiDescription Create a region's Seasonal Weather Forecast for a province f it does not yet exist, or update existing data. Currently supports the Bicol region only.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region=bicol Region name. (Accepts only `bicol` only for now)
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name under the `region`.
 * @apiBody {Object[]} months Array of (6) months seasonal data for the `province`.
 * @apiBody {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} months.mo Month label
 * @apiBody {Number={0...1000}} months.val Rainfall percentage linked to `months.mo` with reference to the PAGASA Rainfall forecast on [https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast](https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast)
 * @apiBody {String='wb_normal','b_normal','near_normal','above_normal'} months.con PAGASA-defined weather condition codes associated with `months.val` (`Way below normal=wb_normal`, `Below normal=b_normal`, `Near normal=near_normal`, `Above normal=above_normal`).
 *
 * @apiSuccess {String} name Saved province name
 * @apiSuccess {String[]} mos Saved month label(s). See `months.mo` for possible values.
 * @apiSuccess {Object[]} months Saved (6) months seasonal data for the `province`.
 * @apiSuccess {String=''jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec''} months.mo Saved month label
 * @apiSuccess {Number={0...1000}} months.val Saved rainfall percentage for `months.mo`
 * @apiSuccess {String='wb_normal','b_normal','near_normal', 'above_normal'} months.con Saved PAGASA-defined weather condition codes associated with `months.val` (`Way below normal=wb_normal`, `Below normal=b_normal`, `Near normal=near_normal`, `Above normal=above_normal`).
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Norte',
 *     months: [
 *       { mo: 'apr', val: '1', con: 'drier' },
 *       { mo: 'may', val: '90', con: 'normal' },
 *       ...
 *       { mo: 'jun', val: '130', con: 'wetter' }
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/weather/seasonal/province', method: 'POST' })
 */
router.post('/weather/seasonal/province', validFirebaseToken, rejectAccountDisabled, validSeasonalProvinceData, upsertForecastProvince)

// ----------------------------------------
// 10-DAY WEATHER FORECAST
// ----------------------------------------

/**
 * @api {post} /weather/10day Upsert 10-Day Weather Forecast by Region
 * @apiName upsertForecastTen
 * @apiGroup WeatherForecast
 * @apiDescription Create a region's 10-Day Weather Forecast for all provinces if it does not yet exist, or update existing data by manually uploading PAGASA's 10-Day Weather Forecast excel files. Currently supports the Bicol region only.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {FormData={day1.xlsx...day10.xlsx}} excel-files[] Array of PAGASA's excel files downloaded from <a href="https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast">https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast</a>
 *
 * @apiSuccess {String} message "Data upload succeess." message
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: FormData,
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: http://localhost:3001/api/weather/10day, method: 'POST' })
 */

router.post('/weather/10day', validFirebaseToken, rejectAccountDisabled, multipleExcelFiles, upsertForecastTen)

// ----------------------------------------
// COMMON WEATHER FORECAST DATA
// ----------------------------------------

/**
 * @api {post} /weather/seasonal/region/common Upsert Common Seasonal Weather Data
 * @apiName updateForecastRegionalSeasonal
 * @apiGroup WeatherForecast Commons
 * @apiDescription Create or update the common regional seasonal weather forecast data if it does not yet exist, or update existing data. The common seasonal weather forecast data common for all provinces includes the `no. of tropical cyclones` per (6) seasonal month and the list of `misc. weather systems that may affect the region`.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String='cyclones_count', 'misc_weather_systems'} type Common seasonal weather forecast data group.
 * - `cyclones_count` upserts data for the **no. of tropical cyclones** per month.
 * - `misc_weather_systems` upserts data for the **misc. weather systems that may affect the region**.
 * @apiBody {String} region Region name
 * @apiBody {Object[]='[{ id: 0, value: "some value" },...]'} data Array of ordered Objects whose content should match with the data type definitions for `type=cyclones_count` or `type=misc_weather_systems`
 * @apiBody {Number} -data.id Unique incremental Number ID
 * @apiBody {String} -data.value String text value associated with `data.id`
 *
 * @apiSuccess {String} type Common seasonal weather forecast data group
 * @apiSuccess {String} updated_by Data updater's Firebase User UID.
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Number} date_created._seconds Seconds
 * @apiSuccess {Number} date_created._nanoseconds Nanoseconds
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {Object[]} data Array of simple key-value pairs corresponding to `type`
 * @apiSuccess {Number} data.id Unique incremental ID
 * @apiSuccess {String} data.value Value associated with `data.id`
 * @apiSuccess {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} data.month Month codes arranged in ascending order if `type=cyclones_count`
 *
 * @apiExample {js} Example usage (type=cyclones_count):
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     type: 'cyclones_count',
 *     data: [
 *       { id: 0, value: '1' },
 *       { id: 1, value: '1 or 3' },
 *       { id: 2, value: '2' },
 *       ...
 *       { id: 5, value: '0 or 1' },
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/weather/seasonal/region/common', method: 'POST' })
 *
 * @apiExample {js} Example usage (type=misc_weather_systems):
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     type: 'misc_weather_systems',
 *     data: [
 *       { id: 0, value: 'Northeast Monsoon' },
 *       { id: 1, value: 'Thunderstorm' },
 *       { id: 1, value: 'ITCZ' },
 *       ...
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/weather/seasonal/region/common', method: 'POST' })
 */
router.post('/weather/seasonal/region/common', validFirebaseToken, rejectAccountDisabled, validRegionalSeasonalParams, updateForecastRegionalSeasonal)

/**
 * @api {post} /weather/tenday/region/common Upsert Common 10-Day Weather Data
 * @apiName updateForecastRegionalTenday
 * @apiGroup WeatherForecast Commons
 * @apiDescription Create or update the common regional 10-day weather forecast data if it does not yet exist, or update existing data. The common 10-day weather forecast data common for all provinces includes the `moon phases` data.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String='moon_phases'} type Common 10-day weather forecast data group.
 * - `moon_phases` upserts data for the moon phases list.
 * @apiBody {String} region Region name
 * @apiBody {Object[]='[{ id: 0, value: "some value" },...]'} data Array of ordered Objects whose content should match with the data type definitions for `type`.
 * @apiBody {Number} -data.id Unique incremental Number ID
 * @apiBody {String} -data.value String text value associated with `data.id`
 * @apiBody {String} [-data.phase] Moon phase name. All (4) moon phases (`MOON_PHASE_TYPE`: `new_moon`, `first_quarter`, `full_moon` and `last_quarter`) key-value pairs, one for each `data` Object are required if `type=moon_phases`
 *
 * @apiSuccess {String} type Common 10-day weather forecast data group
 * @apiSuccess {String} updated_by Data updater's Firebase User UID.
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Number} date_created._seconds Seconds
 * @apiSuccess {Number} date_created._nanoseconds Nanoseconds
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {Object[]} data Array of simple key-value pairs corresponding to `type`
 * @apiSuccess {Number} data.id Unique incremental ID
 * @apiSuccess {String} data.value Value associated with `data.id`
 *
 * @apiExample {js} Example usage (type=moon_phases):
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     type: 'moon_phases',
 *     data: [
 *       { id: 0, value: '29-Jun-22', phase: 'new_moon' },
 *       { id: 1, value: '29-Jun-22', phase: 'first_quarter' },
 *       { id: 2, value: '29-Jun-22', phase: 'full_moon' },
 *       { id: 3, value: '29-Jun-22', phase: 'last_quarter' }
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 */
router.post('/weather/tenday/region/common', validFirebaseToken, rejectAccountDisabled, validRegionalTendayParams, updateForecastRegionalTenday)

/**
 * @api {post} /weather/cyclone/region/common Upsert Common Special Weather Data
 * @apiName updateSpecialTyphoonRegional
 * @apiGroup WeatherForecast Commons
 * @apiDescription Create or update the common special weather forecast data if it does not yet exist, or update existing data. The common special weather forecast data common for all provinces includes the `wind speed` data.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String='wind_speed'} type Common special weather forecast data group.
 * - `wind_speed` upserts data for the wind speed list.
 * @apiBody {String} region Region name
 * @apiBody {Object[]='[{ id: 0, value: 2, province: "Albay", municipalities: [] },...]'} data Array of ordered Objects whose content should match with the data type definitions for `wind_speed`.
 * @apiBody {Number} -data.id Unique incremental Number ID
 * @apiBody {Number} -data.value Wind speed
 * @apiBody {String} -data.province Province name
 * @apiBody {String} -data.municipalities One (1) or more selected municipalities under a province
 *
 * @apiSuccess {String} type Common special weather forecast data group
 * @apiSuccess {String} updated_by Data updater's Firebase User UID.
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Number} date_created._seconds Seconds
 * @apiSuccess {Number} date_created._nanoseconds Nanoseconds
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {Object[]} data Array of simple key-value pairs corresponding to `type`
 * @apiSuccess {Number} data.id Unique incremental ID
 * @apiSuccess {Number} data.value Wind speed
 * @apiSuccess {String} data.province Province name
 * @apiSuccess {String[]} data.municipalities One (1) or more selected municipalities under a province.
 *
 * @apiExample {js} Example usage (type=wind_speed):
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     type: 'wind_speed',
 *     data: [
 *       { id: 0, value: 3, province: 'Albay', municipalities: ['Pio Duran', 'Tiwi'] },
 *       { id: 1, value: 2, province: 'Camarines Sur', municipalities: ['Pamplona'] },
 *       { id: 2, value: 2, province: 'Masbate', municipalities: ['Mandaon', 'Uson'] },
 *       ...
 *     ]
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 */
router.post('/weather/cyclone/region/common', validFirebaseToken, rejectAccountDisabled, validMunicipalities,
  validSpecialWeatherParams, updateSpecialTyphoonRegional)

// API ENDPOINT here

// ----------------------------------------
// OPENWEATHERMAP (Weather Today homepage)
// ----------------------------------------

/**
 * @api {get} /openweather Get current weather data
 * @apiName getWeatherToday
 * @apiGroup Openweather
 * @apiDescription Get the current weather data with 7 days forecast using the Openweather API. This endpoint serves as a proxy for querying the Openweather API to hide the API key.
 *
 * @apiSampleRequest off
 * @apiQuery {Number} lat Latitude
 * @apiQuery {Number} lon Longitude
 *
 * @apiSuccess {String} lat Latitude
 * @apiSuccess {String} lon Longitude
 * @apiSuccess {String} timezone Time zone
 * @apiSuccess {Object} current Current weather today data
 * @apiSuccess {Number} current.dt Date time (current date)
 * @apiSuccess {Number} current.sunrise Date time of sunrise
 * @apiSuccess {Number} current.sunset Date time of sunset
 * @apiSuccess {Number} current.temp Temperature (in Celsius)
 * @apiSuccess {Number} current.feels_like (Same as `temp`)
 * @apiSuccess {Number} current.pressure Wind pressure
 * @apiSuccess {Number} current.humidity Humidity
 * @apiSuccess {Number} current.dew_point Dew point
 * @apiSuccess {Number} current.uvi Ultraviolet rays emission (?)
 * @apiSuccess {Number} current.clouds Amount of clouds (?)
 * @apiSuccess {Number} current.visibility Sun visibility (?)
 * @apiSuccess {Number} current.wind_speed Wind speed
 * @apiSuccess {Number} current.wind_deg Wind degree
 * @apiSuccess {Number} current.wind_gust Wind gust
 * @apiSuccess {Object} current.rain Rain information
 * @apiSuccess {Number} current.rain.1h Amount of rain in 1 hour (?)
 * @apiSuccess {Object[]} current.weathewr General overview of weather information
 * @apiSuccess {Number} current.weather.id Openweather query ID (?)
 * @apiSuccess {String} current.weather.main Weather type (?)
 * @apiSuccess {String} current.weather.description Forematted weather type description (?)
 * @apiSuccess {String} current.weather.icon Icon associated with the weather info
 * @apiSuccess {Object[]} daily 7 days weather forecast (items are almost identical to `current`)
 *
 * @apiExample {js} Example usage:
 * await axios.get('http://localhost:3001/api/openweather?lat=121.156601,lon=14.676182')
 * await axios.get('http://localhost:3001/api/openweather?lat=121.156601,lon=14.676182')
 */
router.get('/openweather', getWeatherToday)

// ----------------------------------------
// REPORTS
// ----------------------------------------

/**
 * @api {post} /reports/seasonal/crops Create Seasonal Report
 * @apiName createReport
 * @apiGroup Report
 * @apiDescription Create a new Seasonal Recommendations report listing all available crop stages and activities for the given parameters (`province`, `municipality`, `crop` and `month`). The municipality's weather condition is derived from the admin-encoded seasonal rainfall weather forecast data. The report's PDF bulletin is uploaded to Firebase Storage and made available to the public PDF downloads list page. A `Bulletin` item associated with the report and PDF is also created.
 *
 * Seasonal crop recommendations are saved with the `type=seasonal` field.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region Region name
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name
 * @apiBody {String} municipality Municipality name
 * @apiBody {String} crop Crop name
 * @apiBody {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} month Month code. Not required if `isFull=true`.
 * @apiBody {String=create} operation Operation type
 * @apiBody {String='en','tag'} language Language type
 * @apiBody {Bool=true, false} [isFull] (Optional) Flag to use the active six (6) seasonal months from the cropping calendar when generating a seasonal report and creating/previewing a bulletin PDF. Defaults to `false`.
 *
 * @apiSuccess {String} id Firestore document ID of the created `Report` object.
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {String='bicol'} region Region name
 * @apiSuccess {String} province Province name
 * @apiSuccess {String} municipality Municipality name
 * @apiSuccess {String} crop Crop name
 * @apiSuccess {String[]} stages Crop stages
 * @apiSuccess {String[]} activities Activities
 * @apiSuccess {String} month Month code
 * @apiSuccess {String='b_normal', 'wb_normal', 'near_normal', 'above_normal'} condition PAGASA weather condition (in code form)
 * @apiSuccess {String='seasonal', 'ten_day'} type Report type
 * @apiSuccess {String} recommendations HTML formatted crop recommendations
 * @apiSuccess {String} smsRecommendations Seasonal SMS text alert
 * @apiSuccess {String='i.e., admin5@gmail.com'} updated_by User email
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Object} date_created._seconds UTC Timestamp in seconds
 * @apiSuccess {Object} date_created._nanoseconds nano seconds
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Sur',
 *     municipality: 'Pamplona',
 *     crop: 'Rice',
 *     month: 'jun',
 *     operation: 'create',
 *     language: 'en',
 *     isFull: true
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/reports/seasonal/crops', method: 'POST' })
 */
router.post('/reports/seasonal/crops', validFirebaseToken, rejectAccountDisabled, validMunicipalities, createReport)

/**
 * @api {delete} /reports/seasonal/crops Delete Report
 * @apiName deleteReport
 * @apiGroup Report
 * @apiDescription Deletes an admin's Report Firestore document. Deleting the report will not delete the Bulletin object and uploaded PDF file associated with the report.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} docId Firebase document ID
 *
 * @apiSuccess {String} message Log message of successful Report deletion.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: { docId: '0lTpn9TgB1TcgXSeEgmD' },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * await axios.delete('http://localhost:3001/api/user/6uHhmVfPdjb6MR4ad5v9Np38z733', obj)
 */
router.delete('/reports/seasonal/crops', validFirebaseToken, rejectAccountDisabled, deleteReport)

/**
 * @api {post} /reports/tenday/crops Create 10-Day Report
 * @apiName createTenDReport
 * @apiGroup Report
 * @apiDescription Create a new **10-Day Farm Weather Outlook and Advisory** crop recommendations report listing all available crops, crop stages and activities for the given parameters (`region`, `province` and `municipality`). The municipality's weather condition is derived from the municipality's latest 10-Day weather forecast data.
 *
 * 10-Day crop recommendations are saved with the `type=ten_day` field.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region Region name
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name
 * @apiBody {String} municipality Municipality name
 * @apiBody {String=en, tag} language Language type
 * @apiBody {String=create} operation Operation type
 * @apiBody {String='Rice', 'Corn', 'etc.'} crop Crop name
 *
 * @apiSuccess {String} id Firestore document ID of the created `Report` object.
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {String='bicol'} region Region name
 * @apiSuccess {String} province Province name
 * @apiSuccess {String} municipality Municipality name
 * @apiSuccess {String} crop Comma-separated crop name(s)
 * @apiSuccess {String[]} stages Crop stages
 * @apiSuccess {String[]} activities Activities
 * @apiSuccess {String='i.e., Sep 21 - Sep 30,2022'} date_range 10-Day weather forecast date range
 * @apiSuccess {String} month Comma-separated month code(s)
 * @apiSuccess {String='b_normal', 'wb_normal', 'near_normal', 'above_normal'} condition PAGASA weather condition (in code form)
 * @apiSuccess {String='NO RAIN', 'LIGHT RAINS', 'MODERATE RAINS', 'HEAVY RAINS'} rainfall PAGASA 10-Day weather condition
 * @apiSuccess {String='seasonal', 'ten_day'} type Report type
 * @apiSuccess {String} recommendations HTML formatted crop recommendations
 * @apiSuccess {String} smsRecommendations Random SMS text recommendations
 * @apiSuccess {String='i.e., admin5@gmail.com'} updated_by User email
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Object} date_created._seconds UTC Timestamp in seconds
 * @apiSuccess {Object} date_created._nanoseconds nano seconds
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Sur',
 *     municipality: 'Pamplona',
 *     language: 'en',
 *     operation: 'create',
 *     crop: 'Rice'
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/reports/tenday/crops', method: 'POST' })
 */
router.post('/reports/tenday/crops', validFirebaseToken, rejectAccountDisabled, validMunicipalities, createTenDReport)

/**
 * @api {post} /reports/special/crops Create Special Report
 * @apiName createSpecialSignalReport
 * @apiGroup Report
 * @apiDescription Creates new **Special Weather Advisory** crop recommendations reports linked with the current active PAGASA tropical cyclone bulletin in two (2) ways:
 *   1. (With wind signals) If a typhoon is active inside the Philippine Area of Responsibility (PAR), admins link typhoon-affected Bicol municipalities to its respective signal number and generate crop recommendations linked with the wind signal number
 *   2. (General) If a typhoon is outside PAR (there are no typhoon wind sigal numbers yet), admins can generate "general" crop recommendations or advisories
 *
 * Special Weather crop recommendations are saved with the `type=special_weather` field.<br>
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String=bicol} region Region name
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name
 * @apiBody {String=Tiwi} municipality Municipality name
 * @apiBody {String='Rice', 'Corn', 'etc.'} crop Crop name
 * @apiBody {String=en, tag} language Language type
 * @apiBody {String=general_no_signal, signal_number_1, signal_number_2, signal_number_3, signal_number_4, signal_number_5} signal Typhoon wind signal code
 * @apiBody {String=create, preview} operation Operation type
 *  - `preview` option returns a PDF bulletin file for viewing or downloading purposes
 *  - `create` option creates a PDF bulletin, uploads it to the online storage and makes it available for viewing/downloading in the public <b>/bulletins</b> page, and creates a bulletin report viewable in the signed-in user's reports dashboard.
 *
 * @apiSuccess {String} id Firestore document ID of the created `Report` object.
 * @apiSuccess {String} uid Firebase user id
 * @apiSuccess {String='bicol'} region Region name
 * @apiSuccess {String} province Province name
 * @apiSuccess {String} municipality Municipality name
 * @apiSuccess {String=n/a} crop Comma-separated crop name(s) (Not available for special bulletins)
 * @apiSuccess {String[]=n/a} stages Crop stages (Not available for special bulletins)
 * @apiSuccess {String[]=n/a} activities Activities (Not available for special bulletins)
 * @apiSuccess {String=n/a} date_range 10-Day weather forecast date range (Not available for special bulletins)
 * @apiSuccess {String=n/a} month Comma-separated month code(s) (Not available for special bulletins)
 * @apiSuccess {String=n/a} condition PAGASA weather condition (in code form). Not available for special bulletins.
 * @apiSuccess {String=n/a} rainfall PAGASA 10-Day weather condition (Not available for special bulletins)
 * @apiSuccess {String='seasonal', 'ten_day', 'special'} type Report type
 * @apiSuccess {String} recommendations HTML formatted crop recommendations
 * @apiSuccess {String} smsRecommendations Random SMS text recommendations
 * @apiSuccess {String='i.e., admin5@gmail.com'} updated_by User email
 * @apiSuccess {Object} date_created Firestore timestamp when the report was created
 * @apiSuccess {Object} date_created._seconds UTC Timestamp in seconds
 * @apiSuccess {Object} date_created._nanoseconds nano seconds
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Sur',
 *     municipality: 'Pamplona',
 *     date: 'Sat Sep 24 2022',
 *     language: 'en',
 *     crop: 'Rice',
 *     operation: 'create'
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/reports/special/crops', method: 'POST' })
 */
router.post('/reports/special/crops', validFirebaseToken, rejectAccountDisabled, validMunicipalities, createSpecialSignalReport)

// ----------------------------------------
// BULLETINS
// ----------------------------------------

/**
 * @api {post} /reports/{REPORT_TYPE}/crops Create Bulletin
 * @apiName createBulletin
 * @apiGroup  Bulletin
 * @apiDescription `Bulletins` are created along with `Reports`. See the **Report - Create Report** API for more information. Requesting this endpoint will create a `Report` object of `REPORT_TYPE` (one of `seasonal`, `tenday`, or `special`), upload the PDF Bulletin to Firebase Storage and create a download link available on the public PDF downloads list page.
 * @apiSampleRequest off
 */

/**
 * @api {post} /reports/{REPORT_TYPE}/crops Preview Bulletin
 * @apiName previewBulletin
 * @apiGroup  Bulletin
 * @apiDescription `Bulletins` are created along with `Reports`. See the **Report - Create Report** API for more information. Requesting this endpoint will return the PDF preview (blob) of `REPORT_TYPE` (one of `seasonal`, `tenday`, or `special`) Seasonal, 10-Day, or Special crop recommendations PDF.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} region Region name
 * @apiBody {String='Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'} province Province name
 * @apiBody {String} municipality Municipality name
 * @apiBody {String='Rice', 'Corn', 'etc.'} crop Crop name
 * @apiBody {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} month Month code
 * @apiBody {String=preview} operation Operation type
 * @apiParam (Response Type) {Blob} [response] Request to return a `blob` response instead of a PDF (`application/pdf`) file.
 *
 * @apiSuccess {application/pdf} file PDF file created from the requested parameters.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     region: 'bicol',
 *     province: 'Camarines Sur',
 *     municipality: 'Pamplona',
 *     crop: 'Rice',
 *     month: 'jun',
 *     operation: 'preview'
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   },
 *   responseType: 'blob' // The blob response type is optional
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/reports/seasonal/crops', method: 'POST' })
 */
// router.post('/reports/seasonal/crops', validFirebaseToken, rejectAccountDisabled, createReport)

/**
 * @api {delete} /bulletins Delete Bulletin
 * @apiName deleteBulletin
 * @apiGroup  Bulletin
 * @apiDescription Deletes a `Bulletin` Firestore document and the PDF file associated with it. A `Bulletin` is a global log of a bulletin PDF file shared across all admin users.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String='seasonal','ten_day','special_weather'} type Bulletin type
 * @apiBody {String} filename Full bulletin PDF file name
 *
 * @apiSuccess {String} message Log message of successful Bulletin and/or PDF file deletion.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *    type: 'seasonal',
 *    filename: 'Albay_Bacacay_Rice_nov_2023.pdf'
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * await axios.delete('http://localhost:3001/api/bulletins', obj)
 */

router.delete('/bulletins', validFirebaseToken, rejectAccountDisabled, deleteBulletin)

// ----------------------------------------
// PHONEBOOK
// ----------------------------------------

/**
 * @api {post} /contact Create Contact
 * @apiName createContact
 * @apiGroup  Phonebook
 * @apiDescription Create a new Contact in the Phonebook
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} name Contact name
 * @apiBody {String} cellnumber Contact cellnumber
 *
 * @apiSuccess {String} message A success message "New Contact added to Phonebook."
 * @apiSuccess {String} id Firestore document ID of the created `Contact` object.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     name: ""
 *     cellnumber: "09991112222",
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const result = await axios({ ...obj, url: 'http://localhost:3001/api/contact', method: 'POST' })
*/
router.post('/contact', validFirebaseToken, rejectAccountDisabled, createContact)

/**
 * @api {get} /contacts View Phonebook
 * @apiName viewPhonebook
 * @apiGroup Phonebook
 * @apiDescription Get the PhonebookRecords of all Firebase Auth Users
 *
 * @apiSampleRequest off
 *
 * @apiSuccess {Object[]} contacts[] Array of Firebase PhonebookRecords (see the 200 success result of the `Create Contact` endpoint for more information)
 *
 * @apiExample {js} Example usage:
 * await axios.get('http://localhost:3001/api/contacts')
 */
router.get('/contacts', validFirebaseToken, rejectAccountDisabled, viewPhonebook)

/**
 * @api {delete} /contact Delete Contact
 * @apiName deleteContact
 * @apiGroup Phonebook
 * @apiDescription Deletes an admin's Contact Firestore document.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} docId Firebase document ID
 *
 * @apiSuccess {String} message Log message of successful Contact deletion.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: { docId: '0lTpn9TgB1TcgXSeEgmD' },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * await axios.delete('http://localhost:3001/api/contact', obj)
 */
router.delete('/contact', validFirebaseToken, rejectAccountDisabled, deleteContact)

/**
 * @api {patch} /contact Update Contact
 * @apiName updateContact
 * @apiGroup Phonebook
 * @apiDescription Update a Firebase Auth Contact's UserRecord by UID
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiBody {String} docId Unique Firebase user id
 * @apiBody {String} [name] Contact's Name
 * @apiBody {String} [cellnumber] Contact's Cellnumber
 *
 * @apiSuccess {String} Message Log message of successful update contact.
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     docId: '85EmjTGiT1cYakDC6VGZ8uaGgZN2',
 *     name: 'Juan de la Cruz',
 *     cellnumber: '09112223333
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: 'http://localhost:3001/api/contact', method: 'PATCH' })
 */
router.patch('/contact', validFirebaseToken, rejectAccountDisabled, updateContact)

// ----------------------------------------
// SMS REPORTS
// ----------------------------------------

/**
 * @api {post} /send Send SMS Recommendations
 * @apiName sendSmsRecommendations
 * @apiGroup  SMS
 * @apiDescription Send SMS Recommendations across all contacts of the signed-in Admin
 * @apiBody {String} numbers String of cell numbers where the SMS Recommendations will sent
 * @apiBody {String} message Actual SMS Recommendation message to be sent
 *
 * @apiSuccess {String} message A success message
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: {
 *     numbers: "09991112222,09993334444",
 *     message: "Hello World"
 *   },
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 */
router.post('/send', validFirebaseToken, rejectAccountDisabled, sendSmsRecommendations)

// ----------------------------------------
// SPECIAL ADVISORY (TROPICAL CYCLONES)
// ----------------------------------------

/**
 * @api {post} /cyclone Update Typhoon Advisory
 * @apiName updateSpecialTyphoon
 * @apiGroup Special Typhoon Advisory
 * @apiDescription Updates ACAP's Special Weather Advisory content by manually initiating the process of syncing PAGASA's latest published tropical cyclone data from their <a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin">Tropical Cyclone Bulletin</a> web page to ACAP.
 * @apiSampleRequest off
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSuccess {Bool} has_cyclone Indicates if typhoon data is available
 * @apiSuccess {String='cyclone_advisory'} type Weather data type
 * @apiSuccess {Date} date_updated Date (Firestore timestamp) of successful data syncing
 * @apiSuccess {Object} date_updated._seconds UTC Timestamp in seconds
 * @apiSuccess {Object} date_updated._nanoseconds nano seconds
 * @apiSuccess {String} email Updater's email. Value is `"-""` if update was done by system.
 * @apiSuccess {String} img Graphic cyclone image URL
 * @apiSuccess {String} summary Cyclone occurrence text description summary
 * @apiSuccess {String} source PAGASA's Tropical Cyclone Bulletin website URL
 * @apiSuccess {String} updated_by Data updater's Firebase User UID. Value is `system` if data syncing was done by system.
 * @apiSuccess {Object} data Main tropical cyclone details
 * @apiSuccess {Object} data.meta Cyclone information metadata
 * @apiSuccess {String} data.meta.typhoon_name Tyhoon name
 * @apiSuccess {String} data.meta.issued_at Date the typhoon data was issued by PAGASA
 * @apiSuccess {Number} data.meta.bulletin_number Tropical Cyclone bulletin number
 * @apiSuccess {Object[]='[{"title": "Location of Eye/Center", "value": "-"},...]'} data.details Typhoon overview main details
 * @apiSuccess {Object[]='[{"title": "SIGNAL NO. 1", "value": "-"},...]'} data.affected Typhoon signal data
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * await axios.post('http://localhost:3001/api/cyclone', obj)
 */
router.post('/cyclone', validFirebaseToken, rejectAccountDisabled, updateSpecialTyphoon)

// ----------------------------------------
// CROPPING CALENDAR
// ----------------------------------------

/**
 * @api {post} /uploadCroppingCalendar/:cropName Upsert Cropping Calendar Excel File
 * @apiName uploadCroppingCalendarExcel
 * @apiGroup Cropping Calendar
 * @apiDescription Uploads a croping calendar Excel file following the supported ACAP 2.0 cropping calendar Excel template.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiParam {String='Rice', 'Corn', 'etc'} cropName Crop name supported by the cropping calendar Excel file
 * @apiBody {FormData={rice_cropping_calendar.xlsx}} excelfile Cropping calendar Excel file following the supported ACAP 2.0 cropping calendar Excel template.
 *
 * @apiSuccess {Object} response
 * @apiSuccess {String="Uploaded Cropping Calendar"} response.message File upload success message
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: FormData,
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: http://localhost:3001/api/uploadCroppingCalendar/:cropName, method: 'POST' })
 */
router.post('/uploadCroppingCalendar/:cropName', validFirebaseToken, singleExcelFile, uploadCroppingCalendarExcel)

// ----------------------------------------
// RECOMMENDATIONS
// ----------------------------------------

/**
 * @api {post} /uploadCropRecommendations/:cropName Upsert Crop Recommendations Excel File
 * @apiName uploadCropRecommendationsExcel
 * @apiGroup Recommendations
 * @apiDescription Uploads a crop recommendation Excel file following the supported ACAP 2.0 crop recommendations Excel template.
 *
 * @apiHeader {String} Authorization Bearer authorization value - signed-in user's firebase ID token.
 *
 * @apiSampleRequest off
 * @apiParam {String='Rice', 'Corn', 'etc'} cropName Crop name supported by the crop recommendations Excel file
 * @apiBody {FormData={rice_recommendations.xlsx}} excelfile Crop recommendations Excel file following the supported ACAP 2.0 crop recommendations Excel template.
 *
 * @apiSuccess {Object} response
 * @apiSuccess {String="Successfully uploaded Rice recommendations!"} response.message File upload success message
 *
 * @apiExample {js} Example usage:
 * const obj = {
 *   data: FormData,
 *   headers: {
 *     Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhNGY4N2Z....'
 *   }
 * }
 *
 * const res = await axios({ ...obj, url: http://localhost:3001/api/uploadCropRecommendations/:cropName, method: 'POST' })
 */
router.post('/uploadCropRecommendations/:cropName', validFirebaseToken, singleExcelFile, uploadCropRecommendationsExcel)

// COLLABORATOR-SHARED WEATHER FORECAST API
// ----------------------------------------

/**
 * @api {get} /weatherforecast 10-Day Weather Forecast
 * @apiName tendayWeatherForecast
 * @apiGroup PAGASA Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint returns the latest formatted Bicol province PAGASA 10-day weather forecast data stored in ACAP's database. A scheduled GitHub Actions workflow syncs ACAP's 10-day weather forecast data with PAGASA's 10-day weather forecast daily between 10:00 AM - 12:00 PM by downloading, parsing, extracting, formatting, and uploading relevant forecast data from the day1.xlsx to day10.xlsx files in [PAGASA's 10-day weather forecast website](https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast) to ACAP's database.
 *
 * ACAP's scheduled cron script skips uploading the current-fetched data if it detects validation errors such as mismatching dates and expected data types. If such error occurs, this endpoint returns the latest logged error in the response's `error` object, and sets all other response values to `null`.
 *
 * ### Sample Response
 *
 * - Sample response data
 * [[Download Here]](files/tenday_latest_regular.json)
 * - Sample response data (with error) [[Download here]](files/tenday_latest_error.json)
 *
 * ### References
 *
 * - PAGASA's 10-day weather forecast website [[link]](https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast)
 * - ACAP-Bicol (RCMAS) 10-Day Weather Forecast Webpage [[link]](https://acap-rcmas.web.app/weather-services/#ten-day-weather-forecast)
 *
 * @apiSampleRequest off
 * @apiQuery {String='tenday'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 *
 * @apiSuccess {String} id Unique Firestore-generated document ID. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} region Region name
 * @apiSuccess {String} province Province name
 * @apiSuccess {String} date_forecast Date the PAGASA 10-day weather forecast was released in String format (as extracted from excel file). Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_forecast_str Date string in YYYY/MM/DD format of the weather forecast date string extracted from the date_forecast field. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_range 10-day validity period of the 10-day weather forecast (as extracted from excel file). Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_start Javascript Date representation of the starting date in the date_range field. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_start_str The `date_start` field in YYYY/MM/DD date string format. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_end Javascript Date representation of the ending date in the date_range field. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_end_str The `date_end` field in YYYY/MM/DD date string format. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {Number} date_created (Timestamp) Date the 10-day weather forecast was processed and uploaded to Firestore by ACAP scheduled scripts. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {String} date_created_str The `date_created` field in YYYY/MM/DD date string format. Its value is `null` if the `error` object response is not null.
 * @apiSuccess {Object} error Error log information describing the latest error encountered while fetching/parsing and validating PAGASA's 10-Day Weather Forecast Excel files every 10:00 AM - 12:00 PM daily. Its value is `null` if there are no errors. If there are errors, all other responses return a `null` value.
 * @apiSuccess {String} error.id Unique error ID
 * @apiSuccess {String} error.message Error message
 * @apiSuccess {Object} municipalities It contains `province` municipality names as fields. Each municipality is an Object[] array containing parsed ten (10) day weather forecast data from PAGASA's 10-day weather forecast Excel files. The "Tiwi" municipality sample response definitions below are similar across all municipalities under a queried province (`"province=Albay"`). The live response data contains the 10-day weather forecast of **ALL** "Albay" province municipalities, not just the "Tiwi" municipality.
 * @apiSuccess {Object[]} municipalities.Tiwi It contains a list of the 10-day weather forecast (from day 1 to day 10) of the "Tiwi" municipality, a municipality under the "Albay" province if `"province=Albay"` in the URL `province` query parameter. "Tiwi" is a placeholder for a Bicol municipality. All municipality objects contain similar fields across all provinces.
 * @apiSuccess {String} municipalities.Tiwi.province Province name
 * @apiSuccess {String} municipalities.Tiwi.municipality Municipality name
 * @apiSuccess {Number} municipalities.Tiwi.tmin Minimum temperature
 * @apiSuccess {Number} municipalities.Tiwi.tmax Maximum temperature
 * @apiSuccess {Number} municipalities.Tiwi.tmean Average (mean) temperature
 * @apiSuccess {String} municipalities.Tiwi.rainfall Rainfall text description
 * @apiSuccess {String} municipalities.Tiwi.rainfall_amt_text Descriptive text of rainfall amount linked with the `rainfall` field.
 * @apiSuccess {String} municipalities.Tiwi.cover Cloud cover text description
 * @apiSuccess {Number} municipalities.Tiwi.humidity Humidity value
 * @apiSuccess {Number} municipalities.Tiwi.wspeed Wind speed value
 * @apiSuccess {String} municipalities.Tiwi.wdirection Wind direction text label
 * @apiSuccess {String} municipalities.Tiwi.day_str Current day's date in YYYY/MM/DD format
 * @apiSuccess {String} municipalities.Tiwi.day_format toDateString() format of the current day's date, minus year
 * @apiSuccess {Number} municipalities.Tiwi.day Day number
 *
 * @apiExample {js} Example usage:
 *
 * await axios.get('http://localhost:3001/api/weatherforecast?type=tenday&province=Camarines Sur&key=YOUR_API_KEY')
 */

/**
 * @api {get} /weatherforecast Seasonal Weather Forecast
 * @apiName seasonalWeatherForecast
 * @apiGroup PAGASA Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint return the latest formatted Bicol province seasonal weather forecast data stored in ACAP's database. The seasonal weather forecast data is updated in set time intervals in collaboration with PAGASA thru an Excel file containing the latest seasonal weather forecast from PAGASA, which designated ACAP-Bicol project personnel manually upload to ACAP's database.
 *
 * ### Updates
 *
 * #### July 19, 2023
 * - A designated ACAP project team member will manually update the seasonal weather forecast data, regarding PAGASA's [Seasonal Forecast Webpage]((https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast)), using PAGASA's latest shared seasonal weather forecast Excel file (for November 2022 - April 2023) for Excel file format reference.
 * - The ACAP project member will encode the target seasonal weather forecast data in the Excel file and upload the updated Excel file to ACAP's database.
 * - The ACAP project personnel will manually look up and update new seasonal weather forecast data from the PAGASA website every 22nd and 27th of the month, as suggested by DA RFO colleagues. Since the definite time of PAGASA's update from their website is not yet known, ACAP personnel will upload an updated Excel file at 9:00 AM (office hours) every 22nd and 27th of the month.
 *
 * ### Sample Response
 * - Sample response data [[Download here]](files/seasonal_latest_regular.json)
 *
 * ### References
 *
 * - PAGASA's Seasonal Forecast Webpage
 * [[link]](https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast)
 * - ACAP-Bicol (RCMAS) Seasonal Weather Forecast Webpage [[link]](https://acap-rcmas.web.app/weather-services/#seasonal-forecast)
 *
 * @apiSampleRequest off
 * @apiQuery {String='seasonal'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 *
 * @apiSuccess {String} region Region name
 * @apiSuccess {String} province Province name
 * @apiSuccess {String[]} mos List of the seasonal 6 months short codes in ascending order
 * @apiSuccess {String} months_year A string representation of all month codes and their year
 * @apiSuccess {Number} date_created (Timestamp) Date the seasonal weather forecast was processed and uploaded to Firestore by admins
 * @apiSuccess {String} date_created_str The `date_created` field in YYYY/MM/DD date string format
 * @apiSuccess {Object[]} months This is an array of objects, with each object containing seasonal weather forecast for a certain month. Items are arranged in ascending order by month. Please read the Months Weather Data section below for more information.
 * @apiSuccess {String} months.condition PAGASA **seasonal** weather forecast condition label
 * @apiSuccess {String} months.condition_label_tenday PAGASA **10-day** weather forecast condition label counterpart of the `months.condition` label.
 * @apiSuccess {String} months.mo Municipality (6) Seasonal weather months code list
 * @apiSuccess {Number} months.year Current year associated with the month
 * @apiSuccess {Number} months.mean Mean of the min/max rainfall values. `null` value means no data is available.
 * @apiSuccess {Number} months.normal Normal rainfall value 1991-2020. `null` value means no data is available.
 * @apiSuccess {Number} months.rainfall %N forecast rainfall value (table with colorful cells). `null` value means no data is available.
 * @apiSuccess {String} months.rainfall_amt_text Descriptive text of rainfall amount linked with the `months.condition_label_tenday` label.
 * @apiSuccess {Number} months.dry_wet Dry/wet days forecast. `null` value means no data is available.
 *
 * @apiExample {js} Example usage:
 *
 * await axios.get('http://localhost:3001/api/weatherforecast?type=seasonal&province=Camarines Sur&key=YOUR_API_KEY')
 */

/**
 * @api {get} /weatherforecast Special Weather Forecast
 * @apiName specialWeatherForecast
 * @apiGroup PAGASA Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint returns the latest formatted Bicol region special (severe cyclone) weather forecast data stored in ACAP's database. A scheduled GitHub Actions workflow syncs ACAP's 10-day weather forecast data with PAGASA's Tropical Cyclone Bulletin web page every (2) two hours by web scraping relevant cyclone forecast data to ACAP's database.
 *
 * ### Sample Responses
 *
 * - Sample response data (with cyclone) [[Download here]](files/special_latest_with-cyclone.json)
 * - Sample response data (no cyclone) [[Download here]](files/special_latest_no-cyclone.json)
 *
 * ### References
 *
 * - PAGASA's Tropical Cyclone Bulletin Webpage [[link]](https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin)
 * - Cached PAGASA Tropical Cyclone Bulletin Webpage (with cyclone) [[link]](https://acap-rcmas-hascyclone.web.app/)
 * - ACAP-Bicol (RCMAS) Special Weather Forecast Webpage [[link]](https://acap-rcmas.web.app/weather-services/#special-weather-forecast)
 *
 * @apiSampleRequest off
 * @apiQuery {String='special'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 *
 * @apiSuccess {String} summary Brief overview showing the status if there are tropical cyclones
 * @apiSuccess {Bool} has_cyclone Flag if a cyclone is detected or not
 * @apiSuccess {String} img URL link to PAGASA's tropical cyclone hi-resoulution image grapic.
 * @apiSuccess {String} img_lowres URL link to the converted lower resolution version of PAGASA's tropical cyclone hi-resoulution image grapic
 * @apiSuccess {String} source PAGASA's Tropical Cyclone Bulletin web page
 * @apiSuccess {String} type Type of weather forecast
 * @apiSuccess {Number} date_created (Timestamp) Date the special weather forecast was processed and uploaded to Firestore by ACAP scheduled scripts
 * @apiSuccess {String} date_created_str The `date_created` field in YYYY/MM/DD date string format
 * @apiSuccess {Number} date_created_affected (Timestamp) Date the cyclone-affected municipalities in the `data.affected[]` list are encoded by admins
 * @apiSuccess {String} date_created_affected_str The `date_created_affected` field in YYYY/MM/DD date string format
 * @apiSuccess {Object} data These data contains detailed cyclone information such as the bulletin number, typhoon name, location of eye/center, movment, and speed. It also contains an array of objects, with each object containing grouped province, wind speed signal and admin-selected affected municipalities for the province.
 * @apiSuccess {Object} data.meta
 * @apiSuccess {String} data.meta.bulletin_number Descriptive bulletin number text
 * @apiSuccess {String} data.meta.typhoon_name Typhoon name
 * @apiSuccess {String} data.meta.issued_at Formatted text description of the Date and time the current bulletin was issued by PAGASA
 * @apiSuccess {Object[]} data.details Main cyclone information
 * @apiSuccess {String} data.details.title Cyclone information item name
 * @apiSuccess {String} data.details.value Cyclone information item content text. This value becomes a String array `String[]` on `data.details.title="Forecast Position"`
 * @apiSuccess {Object[]} data.signal List of web-scraped affected areas (Areas with TCWS) from PAGASA's website grouped by tropical wind signal number.
 * @apiSuccess {String} data.signal.title Signal number label
 * @apiSuccess {Object[]} data.signal.content Affected provinces in the (3) major island groups
 * @apiSuccess {String} data.signal.content.provinces Affected province names and other descriptive text content
 * @apiSuccess {String} data.signal.content.island Affected island group name
 * @apiSuccess {Object[]} data.details.affected Cyclone-affected municipalities encoded by admins
 * @apiSuccess {Number} data.details.affected.id Ordinal numeric ID
 * @apiSuccess {String} data.details.affected.province Province name
 * @apiSuccess {Number='1 - 10'} data.details.affected.affected Wind signal number
 * @apiSuccess {String[]} data.details.affected.municipalities Cyclone-affected municipalities under a province, encoded by admins
 *
 * @apiExample {js} Example usage:
 *
 * await axios.get('http://localhost:3001/api/weatherforecast?type=seasonal&province=Camarines Sur&key=YOUR_API_KEY')
 */

if (process.env.IS_RMCAS_API_ACTIVE === '1') {
  routerShared.get('/api/weatherforecast', isCollaborator, shareWeatherForecast)
}

/**
 * @api {get} /weatherforecast/archives Historical 10-Day Weather Forecast
 * @apiName historicalTendayWeatherForecast
 * @apiGroup PAGASA Historical Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint returns the archived historical 10-day weather forecast data of the Bicol region up to the **_past (3) three months_** maximum in ACAP's database, excluding the current-fetched data set.
 *
 * The 10-day weather forecast data are archived daily before fetching and replacing the "active" current day's data with the latest PAGASA 10-day weather forecast data. A scheduled GitHub Actions workflow syncs ACAP's 10-day weather forecast data with PAGASA's 10-day weather forecast daily between 10:00 AM - 12:00 PM by downloading, parsing, extracting, formatting, and uploading relevant forecast data from the day1.xlsx to day10.xlsx files in [PAGASA's 10-day weather forecast website](https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast) to ACAP's database. ACAP's scheduled cron script skips uploading the current-fetched 10-day weather forecast data if it detects validation errors such as mismatching dates and expected data types.
 *
 * This endpoint returns an array of Objects containing past 10-day weather forecast responses similar to the 200 success response of the [10-Day Weather Forecast API](#api-PAGASA_Weather_Forecast-tendayWeatherForecast) `/api/weatherforecast?type=tenday` endpoint, with additional `date_archived` and `date_archived_str` fields, indicating the date of archiving the data set in the archives collection.
 *
 * Several query options are available by providing (1) of the optional URL query parameters: `date_created`, `date_created_range` or `id`.
 *
 * ### Sample Response
 *
 * (All historical 10-day weather forecast responses are arrays of Object[] that may contain 1 or more 10-day weather forecast data sets.)
 *
 * - Sample response data [[Download here]](files/tenday_historical_regular.json)
 * - Sample response data (with error) [[Download here]](files/tenday_historical_error.json)
 *
 * @apiSampleRequest off
 * @apiQuery {String='tenday'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 * @apiQuery {String='2023/06/27', '2023/03/21', '2023/05/16,2023/06/26,2023/06/27'} [date_created] These are comma-delimited `date_created_str` date(s) of specific historical 10-day weather forecast data of interest, which indicates the date their data is created (uploaded to ACAP's database) in `YYYY/MM/DD` string format. The comma-delimited dates should contain at most 96 ((3) three months) or fewer dates. The endpoint treats similar (duplicate) dates as one. The endpoint omits data for non-existent dates from the response.
 * @apiQUery {String='2023/06/26,2023/06/28', '2023/05/25,2023/06/25', '2023/04/02,2023/04/10'} [date_created_range] These are (2) pairs of comma-delimited `date_created_str` (dates) in YYYY/MM/DD string format. The first date string indicates a "start" date, and the second date indicates an "end" date. These (2) dates indicate a date range for selecting 10-day weather forecast data by their `date_created` field. The `date_created` field indicates the date of uploading the data set to ACAP's database from PAGASA's 10-day weather forecast data by ACAP scheduled scripts.
 * @apiQuery {String='rPk0SIfroZ1NPHrgmQlO', 'xISLyHG9cFEz67770Mwy', 'fsdhdifhai4chgdasd...'} [id] Unique Firestore-generated document ID
 *
 * @apiSuccess {Object[]} response One or more groups of 10-day weather forecast data sets by province. Each item is a 10-day weather forecast data similar to the `200` success response of the [10-Day Weather Forecast](#api-PAGASA_Weather_Forecast-tendayWeatherForecast), with new fields and a more detailed `error` object for each province group:
 * @apiSuccess {Number} response.date_archived (Timestamp) Date the current 10-day weather forecast was archived by ACAP scheduled scripts
 * @apiSuccess {String} response.date_archived_str The `date_archived` field in YYYY/MM/DD date string format
 * @apiSuccess {Object} response.ts_date_archived Firestore Timestamp of the `date_archived` field, used internally for querying the Firestore DB.
 * @apiSuccess {Object} response.ts_date_created Firestore Timestamp of the `date_created` field, used internally for querying the Firestore DB.
 * @apiSuccess {Object} response.ts_date_start Firestore Timestamp of the `date_start` field, used internally for querying the Firestore DB.
 * @apiSuccess {Object} response.ts_date_end Firestore Timestamp of the `date_end` field, used internally for querying the Firestore DB.
 *
 * @apiExample {js} Example usage (date_created):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=tenday&province=Camarines Sur&date_created=2023/06/28&key=YOUR_API_KEY')
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=tenday&province=Camarines Sur&date_created=2023/06/28,2023/06/24,2023/02/14&key=YOUR_API_KEY')
 *
 * @apiExample {js} Example usage (date_created_range):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=tenday&province=Camarines Sur&date_created=2023/06/20,2023/06/28&key=YOUR_API_KEY')
 *
 * @apiExample {js} Example usage (id):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=tenday&province=Camarines Sur&id=rPk0SIfroZ1NPHrgmQlO&key=YOUR_API_KEY')
 */

/**
 * @apiDefine QueryByStartMonth Success 200 - Query by Start Month
 * Seasonal weather forecast data that contains data for (6) seasonal months starting with a specified month (`month_start`).
 */

/**
 * @apiDefine QueryByFullMonth Success 200 - Fetch All Months
 * Seasonal weather forecast data that contains data for a specified month (`month_start`) for each of the months in which it is included in a (6) seasonal month window frame.
 */

/**
 * @apiDefine SpecialQueryByDate Success 200 - Query by Date
 * Special weather forecast data that occured in the `date_created` date.
 */

/**
 * @apiDefine SpecialQueryByMonthYear Success 200 - Query by Month and Year
 * All special weather forecast data that occured in a specified month amd year.
 */

/**
 * @api {get} /weatherforecast/archives Historical Seasonal Weather Forecast
 * @apiName historicalSeasonalWeatherForecastByFirstMonth
 * @apiGroup PAGASA Historical Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint returns the historical seasonal weather forecast data in ACAP's database for up to a maximum of **_past (6) six months_**, starting from the specified `month_start` and `year` URL query parameter, excluding the current Administrator-uploaded seasonal weather forecast data from PAGASA's shared Excel file.
 *
 * Unlike the regular seasonal weather forecast API, the success response of this endpoint returns (1) one or more seasonal weather forecast data for a given `month`, indicating the number of times an Administrator uploaded an Excel file. We expect Administrators to upload at most (2) two times per month, every 22nd and 27th, as confirmed by the DA RFO 5.
 *
 * Since we stopped receiving seasonal weather forecast data in Excel files from PAGASA Excel after the project ended in December 2022, we also expect Administrators to temporarily edit the past PAGASA-shared Excel files with new seasonal weather forecast values, using the on-site seasonal weather forecast in designated PAGASA web pages as reference.
 *
 * ### Sample Response
 *
 * - Sample response data - **Query by Start Month**<br>
 * [[Download Here]](files/seasonal_historical_month.json)
 * - Sample response data - **Fetch All Months**<br>
 * [[Download Here]](files/seasonal_historical_all-months.json)
 *
 * @apiSampleRequest off
 * @apiQuery {String='seasonal'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 * @apiQuery {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} month_start Month code of the 1st month of a set of (6) seasonal weather forecast months.
 *
 * If provided, make sure to omit the `month` parameter and expect to receive a successful response following the response structure of **Success 200 - Query by Start Month**.
 *
 * If omitted and only the `year` parameter is provided, the response will contain the archived seasonal weather forecast for all months under the `year` parameter.
 * @apiQuery {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} month Any month code.
 *
 * If provided, make sure to omit the `month_start` parameter and expect to receive a successful response following the response structure of **Success 200 - Fetch All Months**.
 * @apiQuery {String='2023', '2022', '2020'} year Year associated with the `month_start` parameter.
 *
 * @apiSuccess (QueryByStartMonth) {Object[]} response One or more groups of past seasonal weather forecast data, containing seasonal weather forecast for (6) months starting with the `month_start` month.
 * @apiSuccess (QueryByStartMonth) {String} response.region Region name
 * @apiSuccess (QueryByStartMonth) {String} response.province Province name
 * @apiSuccess (QueryByStartMonth) {String} response.month Month code of the 1st seasonal month in the data set's (6) seasonal months (`month_start`).
 * @apiSuccess (QueryByStartMonth) {String} response.year Year
 * @apiSuccess (QueryByStartMonth) {String} response.doc_name Year and month summary text in {YYYY}-{MM} format.
 * @apiSuccess (QueryByStartMonth) {Object[]} data Set of seasonal weather forecasts beginning with the specified `month_start`. We expect Administrators to upload at most (2) two times per month, every 22nd and 27th, as confirmed by the DA RFO 5.
 *
 * Each item is a seasonal weather forecast data similar to the 200 success response of the regular Seasonal Weather Forecast API.
 *
 * @apiExample {js} Example usage (month_start, year):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=seasonal&province=Camarines Sur&year=2023&month_start=jul&key=YOUR_API_KEY')
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=seasonal&province=Camarines Sur&year=2023&key=YOUR_API_KEY')
 *
 * @apiSuccess (QueryByFullMonth) {Object[]} response One or more groups of past seasonal weather forecast data, containing seasonal weather forecast for all occurences of the specified `month` and `year` in other groups of (6) six seasonal months.
 * @apiSuccess (QueryByFullMonth) {String} response.province Province name
 * @apiSuccess (QueryByFullMonth) {String} response.month Month code
 * @apiSuccess (QueryByFullMonth) {String} response.year Year
 * @apiSuccess (QueryByFullMonth) {Object} forecast Set of seasonal weather forecasts for the specified `month` and `year`, as recorded in each of the past (5) months and specified (1) month that includes the `month` parameter.
 *
 * It contains the past (5) months up to the specified `month` (for a total of (6) seasonal months) as **month code keys**, indicating several `month_starts`. Each month code key is an Object array containing minimal seasonal weather forecast data for the specified `month` included in the key's (6) internal seasonal months.
 *
 * For example: `forecast.jul = [{ id, info, rainfall, condition }...]`
 *
 * @apiExample {js} Example usage (month):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=seasonal&province=Camarines Sur&year=2023&month=jul&key=YOUR_API_KEY')
 *
 * @apiSuccess (QueryByFullMonth) {Object[]} forecast.jul (`jul` is a placeholder for other **month code keys**, whose past (5) and current (1) month include the `month` parameter.)
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.id Unique identifier
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.info Data set description
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.date_created_str Date in YYYY/MM/DD string format, indicating the date of of successfully uploading and saving the data set to the database,
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.date_archived_str Date in YYYY/MM/DD string format, indicating the date when this data set is stored in the historical arhives collection.
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.ts_date_archived Firestore Timestamp version of the `date_archived_str` field.
 * @apiSuccess (QueryByFullMonth) {Number} forecast.jul.year Seasonal weather forecast year of the `month` parmeter inside one of the (5) seasonal months after`jul`.
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.months_year A string representation of all month codes and their year
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.condition PAGASA **seasonal** weather forecast condition label of the `month` parmeter inside one of the (5) seasonal months after`jul`.
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.condition_label_tenday PAGASA **10-day** weather forecast condition label counterpart of the `months.condition` label of the `month` parmeter inside one of the (5) seasonal months after`jul`..
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.rainfall %N forecast rainfall value (table with colorful cells) of the `month` parmeter inside one of the (5) seasonal months after`jul`.
 * @apiSuccess (QueryByFullMonth) {String} forecast.jul.rainfall_amt_text Descriptive text of rainfall amount linked with the `months.condition_label_tenday` label of the `month` parmeter inside one of the (5) seasonal months after`jul`.
 */

/**
 * @api {get} /weatherforecast/archives Historical Special Weather Forecast
 * @apiName historicalSpecialWeatherForecastByDate
 * @apiGroup PAGASA Historical Weather Forecast
 * @apiDescription {{INACTIVE_TEXT}}
 *
 * This endpoint returns the historical special (severe cyclone) weather forecast data in ACAP's database up to a maximum of the **_past (3) three_** months using the `date` and `year` URL query parameters, excluding the current active cyclone weather forecast data.
 *
 * This endpoint only returns data sets that have cyclone or typhoon data. A script runs along with the Cron job mentioned in the 10-Day Weather Forecast API to archive the active severe cyclone weather forecast (with cyclone data) before overwriting it with newly web-scraped cyclone weather forecast data.
 *
 * ### Sample Response
 *
 * - Sample response data - **Query by Date**<br>
 * [[Download Here]](files/special_historical_by-date.json)
 * - Sample response data - **Query by Month and Year**<br>
 * [[Download Here]](files/special_historical_month-year.json)
 *
 * @apiSampleRequest off
 * @apiQuery {String='special'} type Weather forecast type
 * @apiQuery {String='Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'} province Case-sensitive province name in the Bicol region.
 * @apiQuery {String} key API key
 * @apiQuery {String='2023/08/29', '2023/08/31'} date The date string in YYYY/MM/DD format of a cyclone weather forecast's `date_created` field indicates the date they were saved to the database by the Cron job.
 *
 * - If provided, omit the month and year parameters and expect to receive a successful response following the response structure of the **10-Day Weather Forecast API**, with new response fields:
 *
 *    - `date_archived`
 *    - `date_archived_str`
 *    - `ts_date_archived`
 *    - `date_created_str`
 *
 * - If omitted and users only provide the `year` and `month` parameters, the response will contain all archived cyclone weather forecasts for the specified `month` under the `year` parameter.
 *
 * - This query parameter generates a successful response following the response structure of **Success 200 Query by Date**.
 * @apiQuery {String='jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'} month Any month code.
 *
 * - If provided, omit the `date` parameter and expect to receive a successful response following the response structure of **Success 200 Query by Month and Year**.
 *
 * - This parameter requires having the `year` parameter present.
 * @apiQuery {String='2023', '2022', '2020'} year Year associated with the `month_start` parameter.
 *
 * @apiExample {js} Example usage (date):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=seasonal&province=Camarines Sur&date=2023/08/31&key=YOUR_API_KEY')
 *
 * @apiSuccess (SpecialQueryByDate) {Object[]} response Past special weather forecast data that occured on the specified `date`. Its success is similar to the `200` success response of the [Special Weather Forecast API](#api-PAGASA_Weather_Forecast-specialWeatherForecast), with new fields for more detailed tracking:
 * @apiSuccess (SpecialQueryByDate) date_archived (Timestamp) Date the special weather forecast was archived by ACAP scheduled scripts
 * @apiSuccess (SpecialQueryByDate) date_updated (Timestamp) Date the special weather forecast was web-scraped and intially stored by ACAP scheduled scripts
 * @apiSuccess (SpecialQueryByDate) date_created_str The `date_updated` field in YYYY/MM/DD date string format
 * @apiSuccess (SpecialQueryByDate) date_archived_str The `date_archived` field in YYYY/MM/DD date string format
 *
 * @apiExample {js} Example usage (month, year):
 * await axios.get('http://localhost:3001/api/weatherforecast/archives?type=seasonal&province=Camarines Sur&year=2023month=aug&key=YOUR_API_KEY')
 *
 * @apiSuccess (SpecialQueryByMonthYear) {Object[]} response One or more groups of past special weather forecast data that occured on the specified `month` and `year`. Its success is similar to the `200` success response of the [Special Weather Forecast API](#api-PAGASA_Weather_Forecast-specialWeatherForecast), with new fields for more detailed tracking:
 * @apiSuccess (SpecialQueryByMonthYear) date_archived (Timestamp) Date the special weather forecast was archived by ACAP scheduled scripts
 * @apiSuccess (SpecialQueryByMonthYear) date_updated (Timestamp) Date the special weather forecast was web-scraped and intially stored by ACAP scheduled scripts
 * @apiSuccess (SpecialQueryByMonthYear) date_created_str The `date_updated` field in YYYY/MM/DD date string format
 * @apiSuccess (SpecialQueryByMonthYear) date_archived_str The `date_archived` field in YYYY/MM/DD date string format
 */

if (process.env.IS_RMCAS_API_ACTIVE === '1') {
  routerShared.get('/api/weatherforecast/archives',
    isCollaborator,
    validHistoricalForecastTenday,
    validHistoricalForecastSeasonal,
    validHistoricalForecastSpecial,
    historicalWeatherForecast)
}

module.exports = {
  router,
  routerShared: process.env.IS_RMCAS_API_ACTIVE === '1'
    ? routerShared
    : null
}
