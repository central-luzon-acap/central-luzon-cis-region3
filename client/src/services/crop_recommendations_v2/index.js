import { CropRecommendations } from './crop_recommendations'

const CR = new CropRecommendations()

export const getFormattedRecommendations =
  CR.getFormattedRecommendations.bind(CR)
export const getFormattedRecommendationsFromStages =
  CR.getFormattedRecommendationsFromStages.bind(CR)
export const getCropRecommendationsLite = CR.getCropRecommendationsLite.bind(CR)
export const getRecommendations = CR.getRecommendations.bind(CR)
export const getSeasonalGeneralRecommendations =
  CR.getSeasonalGeneralRecommendations.bind(CR)
export const getRecommendationsFlexible = CR.getRecommendationsFlexible.bind(CR)
export const getRecommendationsSMS = CR.getRecommendationsSMS.bind(CR)
export const getCropRecommendations = CR.getCropRecommendations.bind(CR)
export const updateRecommendation = CR.updateRecommendation.bind(CR)
/**
 * Fetches documents from a crop recommendations collection using `where()` query fields
 * @typedef {Object} params - Input parameters
 * @param {String} type - Recommendations collection suffix
 *    - values: `seasonal|tenday|special`
 *    - values: `seasonal_sms|tenday_sms|special_sms`
 * @param {Object[]} queryFields - List of Firestore `where()` query fields whose items follow the format:
 *    - i.e., `{ field: 'crop_stage', op: '==', value: 'mat' }`
 * @returns {Object[]} List of Firestore documents
 */
export const getRecommendationsQuery = CR.getRecommendationsQuery.bind(CR)
