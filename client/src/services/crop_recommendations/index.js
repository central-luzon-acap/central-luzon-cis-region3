import { CropRecommendations } from './crop_recommendations'

const CR = new CropRecommendations()

export const getFormattedRecommendations = CR.getFormattedRecommendations.bind(CR)
export const getFormattedRecommendationsFromStages = CR.getFormattedRecommendationsFromStages.bind(CR)
export const getCropRecommendationsLite = CR.getCropRecommendationsLite.bind(CR)
