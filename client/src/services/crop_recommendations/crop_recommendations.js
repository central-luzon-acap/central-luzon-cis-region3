import FirestoreService from '../../utils/firestoreutils'
import { RECOMMENDATION_TYPE } from '@/utils/constants/recommendations'

export const _CropRecommendations = {
  // Firestore collections
  CROP_REC_LIST_RECS_LITE: 'n_list_crop_recommendations',
  CROP_REC_LIST_RECS_FORMATTED: 'n_list_crop_recommendations_'
}

export class CropRecommendations extends FirestoreService {
  /**
   * Fetch formatted crop recommendations from multiple crop stages
   * @param {String[]} cropstages - List of crop stages
   * @param {String} forecast - Weather forecast (rainfall condition)
   * @param {String} type - Crop recommendation type. One of RECOMMENDATION_TYPE.
   * @returns {Object[]} - Crop recommendations for multiple crop stages
   */
  getFormattedRecommendationsFromStages = async ({ cropstages, forecast, type }) => {
    if (cropstages === undefined || forecast === undefined) {
      return
    }

    const rCollection = `${_CropRecommendations.CROP_REC_LIST_RECS_FORMATTED}${type}`

    const colRef = this.collection(this.db, rCollection)
    let q

    if (type === RECOMMENDATION_TYPE.SEASONAL) {
      q = this.query(colRef,
        this.where('crop_stage', 'in', cropstages),
        this.where('forecast', '==', forecast))
    } else {
      q = this.query(colRef, this.where('crop_stage', 'in', cropstages))
    }

    const data = await this.getCollectionData(rCollection, '', q)
    return data
  }

  /**
   * Fetch formatted crop recommendations from (1) crop stage
   * @param {String} cropstage - Crop stage name
   * @param {String} forecast - Weather forecast (rainfall condition)
   * @param {String} type - Crop recommendation type. One of RECOMMENDATION_TYPE.
   * @returns {Object[]} - Crop recommendations for (1) crop stage
   */
  getFormattedRecommendations = async ({ cropstage, forecast, type }) => {
    if (cropstage === undefined || forecast === undefined) {
      return
    }

    const rCollection = `${_CropRecommendations.CROP_REC_LIST_RECS_FORMATTED}${type}`

    const colRef = this.collection(this.db, rCollection)
    let q

    if (type === RECOMMENDATION_TYPE.SEASONAL) {
      q = this.query(colRef,
        this.where('crop_stage', '==', cropstage),
        this.where('forecast', '==', forecast))
    } else {
      q = this.query(colRef, this.where('crop_stage', '==', cropstage))
    }

    const data = await this.getCollectionData(rCollection, '', q)
    return data
  }

  /**
   * Fetch all data from the (simplified) crop recommendations of a certain type
   * @param {String} type - Crop recommendation type. One of RECOMMENDATION_TYPE.
   * @returns {Object} - { data, metadata }
   *    - data: {Object[]} All crop recommendations for a RECOMMENDATION_TYPE
   *    - metadata: {Object} Miscellaneous descriptive data description
   */
  getCropRecommendationsLite = async ({ type }) =>
    await this.getDocumentData(_CropRecommendations.CROP_REC_LIST_RECS_LITE, type)
}
