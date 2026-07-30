const RecommendationsV2 = require('./recommendationsv2')
const RE2 = new RecommendationsV2()

/**
  * Retrieves the climate risk code of a given climate risk label
  * @param {String} climateRisk - Climate risk label
  * @param {String} weatherType - Type of weather forecast with a climate risk field in their crop recommendations. One of tenday|seasonal
  * @returns {String} Climate risk code
  */
const getClimateRiskCode = RE2.getClimateRiskCode.bind(RE2)

/**
  * Fetch crop recommendations from a designated Firestore collection (seasonal, 10-day, special weather) based from given parameters.
  * @typedef {Object} params - Input object
  * @param {String[]} params.stages - String list of crop stages
  * @param {String} params.climateRisk - Climate
  * @param {String} params.crop - Crop name
  * @param {String} params.collection - Firestore collection name. One of FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.
  * @param {Number} params.limit - Number of documents to return from the query
  * @returns {Object[]} Crop recommendations in Firestore documents
  */
const getrecommendationsV2 = RE2.getrecommendationsV2.bind(RE2)

/**
  * Fetches an SMS crop recommendation from a designated Firestore collection (seasonal, 10-day, special weather) based from given parameters.
  * @typedef {Object} params - Input object
  * @param {String[]} params.stages - String list of crop stage codes
  * @param {String} params.climateRisk - Climate risk descriptive label
  * @param {String} params.climateRiskKey - Firestore field name containing the climate risk code. Defaults to "risk"
  * @param {String} params.crop - Crop name
  * @param {String} params.collection - Firestore collection name. One of FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.
  * @param {Number} params.limit - Number of documents to return from the query
  * @returns {Object[]} Crop recommendations in Firestore documents
  */
const getSmsRecommendationsV2 = RE2.getSmsRecommendationsV2.bind(RE2)

/**
  * Return a list of text farm operations
  * @param {Object[]} list - List of farm operations contained in a "farm_activity" key following the format i.e.: [{ id, label, farm_activity, ... }...]
  * @returns {String[]} String array list of farm operations
  */
const getfarmoperationsV2 = RE2.getfarmoperationsV2.bind(RE2)

/**
  * Formats the 10-day recommendations for displaying in the current 10-day bulletin PDF's "Commodities" section
  * @param {Object[]} recommendations - Crop recommendations in Firestore documents
  * @param {Object} cropstagesByCrop - Unique crop stages list attached to a crop key
  * @returns {Object[]} List of crops with a list of unique crop stages and farm operations, i.e.:
  *    - [{ crop: "Rice", stages: ['stage1', 'stage2',...], farmoperations: ['farmoperation1',...] },...]
  */
const getcommoditiesV2 = RE2.getcommoditiesV2.bind(RE2)

/**
  * Groups recommendations Firestore documents into groups of crop stages and farm operations
  * @param {Object[]} recommendations - A collection of Firestore documents containing crop recommendations
  * @param {String[]} farmoperations - Unique list of farm operations from the recommendations
  * @param {Object} uniqueCropStages - Filtered and ordered (by month and cropping) Object array list of all cropping calendar stages for a specific crop
  *    - Retrieved from `this.getcropcalstagesdataV2()` and filtered by target month/s
  *    - Follows the format:
  *    ```
  *    {
  *      [
  *        { id: 0, code: 'mat', label: 'Maturing' },
  *        { id: 1, code: 'plant', label: 'Newly Planted' },
  *        { id: 2, code: 'prep', label: 'Preparation Stage' },
  *      ...,
  *      ]
  *    }
  *    ```
  * @returns {Object} Recommendations with crop stages as keys. Each crop stage contains farm operations as keys, and each farm operation contains an array of recommendations i.e.:
  *    ```
  *    {
  *       "Newly-Planted": {
  *          "Planting/Transplanting": [{ id: 0, crop_stage, farm_activity, practice,... },...],
  *          ...
  *       },
  *       "Vegetative/Reproductive": {
  *          "Fertlizer Application": [{ id: 0, crop_stage, farm_activity, practice,... }...],
  *          "Pest and Weed Management": [{ id: 1, crop_stage, farm_activity, practice,... },...],
  *          ...
  *       },
  *       ...
  *    }
  *    ```
  */
const grouprecommendationsV2 = RE2.grouprecommendationsV2.bind(RE2)

/**
  * Return and merge the HTML tags of crop recommendations of a certain "recommendationType" into one full HTML tag string
  * @param {Object} recommendationGroup - Recommendations grouped by crop stages then farm operations
  * @param {String} recommendationType - Recommendation key to retrieve from the recommendations row
  * @param {Object[]} params.cropStages - Ordered list of crop stages data found in `params.recommendationGroup`
  *    - Follows the format: `[{ id: 0, label: 'Maturing', code: 'mat'},...]`
  * @returns {String} HTML text containing all crop recommendations HTML tags
  */
const formatrecommendationsV2 = RE2.formatrecommendationsV2.bind(RE2)

/**
  * Delete all Recommendation documents in the collection given a crop.
  * @param {String} crop - Crop property of a Recommendation document
  * @param {String} recommendationType - Recommendation key to retrieve from the recommendations row
*/
const deleteRecommendationsV2 = RE2.deleteRecommendationsV2.bind(RE2)

/**
  * Creates a "general" recommendation for one of the major recommendation types.
  * @typedef {Object} params Input parameters
  * @param {String} params.type Recommendation type. One of seasonal|tenday|special
  * @param {String} params.recommendations Formatted random "general" recommendations in HTML tags format
  * @param {String} params.smsRecommendations SMS text recommendations to go along with `params.recommendations`
  * @param {String} params.uid User ID
  * @param {String} params.email User email
  * @returns {Object} Success response { docRef, type }
  */
const createGeneralRecommendation = RE2.createGeneralRecommendation.bind(RE2)

module.exports = {
  getClimateRiskCode,
  getrecommendationsV2,
  getSmsRecommendationsV2,
  getfarmoperationsV2,
  getcommoditiesV2,
  grouprecommendationsV2,
  formatrecommendationsV2,
  deleteRecommendationsV2,
  createGeneralRecommendation
}
