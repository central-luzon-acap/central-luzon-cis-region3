import { CropRecommendationsUpload } from './cropping_recommendations_upload'

const CRU = new CropRecommendationsUpload()

export const upsertCropRecommendations = CRU.upsertCropRecommendations.bind(CRU)