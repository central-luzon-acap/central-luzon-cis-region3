import FirestoreService from '../../utils/firestoreutils'
import { RECOMMENDATION_TYPE } from '@/utils/constants/recommendations'

export const _CropRecommendations = {
  // Firestore collections
  CROP_REC_LIST_RECS_LITE: 'n_list_crop_recommendations',
  CROP_REC_LIST_RECS_FORMATTED: 'n_list_crop_recommendations_',
  CROP_REC_LIST: 'n_crop_recommendations_',
  CROP_REC_SMS_LIST: 'n_crop_recommendations_',
}

export class CropRecommendations extends FirestoreService {
  /**
   * Fetch formatted crop recommendations from multiple crop stages
   * @param {String[]} cropstages - List of crop stages
   * @param {String} forecast - Weather forecast (rainfall condition)
   * @param {String} type - Crop recommendation type. One of RECOMMENDATION_TYPE.
   * @returns {Object[]} - Crop recommendations for multiple crop stages
   */
  getFormattedRecommendationsFromStages = async ({
    cropstages,
    forecast,
    type,
  }) => {
    if (cropstages === undefined || forecast === undefined) {
      return
    }

    const rCollection = `${_CropRecommendations.CROP_REC_LIST_RECS_FORMATTED}${type}`

    const colRef = this.collection(this.db, rCollection)
    let q

    if (type === RECOMMENDATION_TYPE.SEASONAL) {
      q = this.query(
        colRef,
        this.where('crop_stage', 'in', cropstages),
        this.where('forecast', '==', forecast),
      )
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
      q = this.query(
        colRef,
        this.where('crop_stage', '==', cropstage),
        this.where('forecast', '==', forecast),
      )
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
    await this.getDocumentData(
      _CropRecommendations.CROP_REC_LIST_RECS_LITE,
      type,
    )

  getCropRecommendations = async ({ crop, type }) => {
    if (!crop || !type) return

    const rCollection = `${_CropRecommendations.CROP_REC_LIST}${type}`
    const colRef = this.collection(this.db, rCollection)
    const q = this.query(colRef, this.where('crop', '==', crop))
    const data = await this.getCollectionDataWithID(rCollection, '', q)
    return data
  }

  getRecommendations = async ({
    climateRisk,
    _cropStage,
    crop,
    type,
    multipleStages,
  }) => {
    if (!climateRisk || !crop) return
    if (multipleStages) {
      if (_cropStage.length === 0) return
    } else {
      if (!_cropStage) return
    }

    const rCollection = `${_CropRecommendations.CROP_REC_LIST}${type}`

    const colRef = this.collection(this.db, rCollection)

    let q
    if (multipleStages) {
      q = this.query(
        colRef,
        this.where('climate_risk', '==', climateRisk),
        this.where('crop_stage', 'in', _cropStage),
        this.where('crop', '==', crop),
      )
    } else {
      q = this.query(
        colRef,
        this.where('climate_risk', '==', climateRisk),
        this.where('crop_stage', '==', _cropStage),
        this.where('crop', '==', crop),
      )
    }

    const data = await this.getCollectionData(rCollection, '', q)
    return data
  }

  getSeasonalGeneralRecommendations = async ({ climateRisk, crop }) => {
    if (!climateRisk || !crop) return

    const rCollection = 'n_crop_recommendations_seasonal_general'
    const colRef = this.collection(this.db, rCollection)
    const q = this.query(
      colRef,
      this.where('climate_risk', '==', climateRisk),
      this.where('crop', '==', crop),
    )
    const data = await this.getCollectionData(rCollection, '', q)
    return data
  }

  /**
   * Fetch data from the crop recommendations v2 of a certain type using optional Firestore query fields.
   * @typedef {Object} params - Input fields
   * @param {String} params.climateRisk - Climate risk code
   * @param {String[]|String} params._cropStage - Crop stage code
   *    - {String} if `param.multipleStages=false`
   *    - {String[]} String array list of crop stage codes if `params.multipleStages=true`
   * @param {String} params.crop - Crop name
   * @param {String} params.type - Crop recommendation type. One of seasonal|tenday|special
   * @param {Bool} params.multipleStages - Flag to use an array of crop stages Firestore query field. Defaults to `false`
   * @returns
   */
  getRecommendationsFlexible = async ({
    climateRisk,
    _cropStage,
    crop,
    type,
    multipleStages = false,
  }) => {
    const rCollection = `${_CropRecommendations.CROP_REC_LIST}${type}`
    const colRef = this.collection(this.db, rCollection)

    if (!crop) return

    const queries = [this.where('crop', '==', crop)]

    if (climateRisk) {
      queries.push(this.where('climate_risk', '==', climateRisk))
    }

    if (_cropStage) {
      if (multipleStages) {
        queries.push(this.where('crop_stage', 'in', _cropStage))
      } else {
        queries.push(this.where('crop_stage', '==', _cropStage))
      }
    }

    const q = this.query(colRef, ...queries)
    return await this.getCollectionData(rCollection, '', q)
  }

  getRecommendationsQuery = async ({ type, queryFields = [] }) => {
    if (!type) {
      throw new Error('Missing parameter/s')
    }

    const rCollection = `${_CropRecommendations.CROP_REC_LIST}${type}`
    const colRef = this.collection(this.db, rCollection)
    const queries = queryFields.map((item) =>
      this.where(item.field, item.op, item.value),
    )

    const q = this.query(colRef, ...queries)
    return await this.getCollectionData(rCollection, '', q)
  }

  getRecommendationsSMS = async ({ crop, climateRisk, type }) => {
    if (!crop || !climateRisk || !type) return

    const rCollection = `${_CropRecommendations.CROP_REC_SMS_LIST}${type}`
    const colRef = this.collection(this.db, rCollection)
    const q = this.query(
      colRef,
      this.where('crop', '==', crop),
      this.where('climate_risk', '==', climateRisk),
    )

    const data = await this.getCollectionData(rCollection, '', q)
    return data
  }

  updateRecommendation = async ({ type, newRecommendation }) => {
    const rCollection = `${_CropRecommendations.CROP_REC_SMS_LIST}${type}`
    const colRef = this.collection(this.db, rCollection)
    const docRef = this.doc(colRef, newRecommendation.docid)

    delete newRecommendation.docid
    await this.updateDoc(docRef, newRecommendation)
  }
}
