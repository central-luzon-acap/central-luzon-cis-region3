const { admin, db } = require('../../utils/db')

const { FIRESTORE_COLLECTIONS } = require('../../utils/constants')

// Climate risks definitions for Seasonal SMS + recommendations
const SeasonalTab = require('../../scripts/seeders/13_recommendations/classes/seasonaltabSMS')

// Climate risks definitions for 10-day SMS only
const TendayTabSMS = require('../../scripts/seeders/13_recommendations/classes/tendaytabSMS_v3')

// Climate risks definitions for 10-day Recommendations only
const TendayTab = require('../../scripts/seeders/13_recommendations/classes/tendaytabv2')

class RecommendationsV2 {
  // Climate risks data dictionary
  #CLIMATE_RISKS = {}

  constructor () {
    const CLIMATE_RISKS = new SeasonalTab()
    const CLIMATE_RISKS_TENDAY_RECOM = new TendayTab()
    const CLIMATE_RISKS_TENDAY_SMS = new TendayTabSMS()

    // Merge together 10-Day SMS and Recommendations climate risks under one Object
    const CLIMATE_RISKS_TENDAY = {
      ...CLIMATE_RISKS_TENDAY_RECOM.NORMAL_CLIMATE_RISK_TENDAY_CODES,
      ...CLIMATE_RISKS_TENDAY_SMS.NORMAL_CLIMATE_RISK_TENDAY_SMS_CODES
    }

    this.#CLIMATE_RISKS.seasonal = { ...CLIMATE_RISKS.NORMAL_CLIMATE_RISK_SEASONAL_SMS_CODES }
    this.#CLIMATE_RISKS.tenday = { ...CLIMATE_RISKS_TENDAY }
  }

  /**
   * Retrieves the climate risk code of a given climate risk label
   * @param {String} climateRisk - Climate risk label
   * @param {String} weatherType - Type of weather forecast with a climate risk field in their crop recommendations. One of tenday|seasonal
   * @returns {String} Climate risk code
   */
  getClimateRiskCode (climateRisk, weatherType) {
    try {
      if (climateRisk) {
        return this.#CLIMATE_RISKS[weatherType][climateRisk]
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Fetch crop recommendations from a designated Firestore collection (seasonal, 10-day, special weather) based from given parameters.
   * @typedef {Object} params - Input object
   * @param {String[]} params.stages - String list of crop stages
   * @param {String} params.climateRisk - Climate
   * @param {String} params.crop - Crop name
   * @param {String} params.windSignal - Cyclone wind signal code (see WIND_SIGNALS, WIND_SIGNAL_CODES)
   * @param {String} params.collection - Firestore collection name. One of FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.
   * @param {Number} params.limit - Number of documents to return from the query
   * @returns {Object[]} Crop recommendations in Firestore documents
   */
  async getrecommendationsV2 ({ stages, climateRisk, crop, windSignal, collection, limit = 0 }) {
    if (!Object.values(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2).includes(collection)) {
      throw new Error('Invalid recommendations collection name')
    }

    try {
      let docRef = db.collection(collection)

      if (stages !== undefined) {
        docRef = docRef.where('crop_stage', 'in', stages)
      }

      if (crop !== undefined) {
        docRef = docRef.where('crop', '==', crop)
      }

      if (windSignal !== undefined) {
        docRef = docRef.where('wind_signal', '==', windSignal)
      }

      if (limit > 0) {
        docRef = docRef.limit(limit)
      }

      if (climateRisk !== undefined) {
        const recommendationType = Object.keys(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2)
          .find(key => FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2[key] === collection)
          .toLocaleLowerCase()

        const risk = this.getClimateRiskCode(climateRisk, recommendationType)

        if (!risk) {
          throw new Error(`Unsupported climate risk: ${risk}`)
        }

        docRef = docRef.where('climate_risk', '==', risk)
      }

      const temp = await docRef.get()
        .then((snapshot) =>
          snapshot.docs.map((doc) =>
            doc.data()
          ))

      return temp
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Fetches an SMS crop recommendation from a designated Firestore collection (seasonal, 10-day, special weather) based from given parameters.
   * @typedef {Object} params - Input object
   * @param {String[]} params.stages - String list of crop stage codes
   * @param {String} params.climateRisk - Climate risk descriptive label
   * @param {String} params.climateRiskKey - Firestore field name containing the climate risk code. Defaults to "risk"
   * @param {String} params.crop - Crop name
   * @param {String} params.windSignal - Cyclone wind signal code (see WIND_SIGNALS, WIND_SIGNAL_CODES)
   * @param {String} params.collection - Firestore collection name. One of FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.
   * @param {Number} params.limit - Number of documents to return from the query
   * @returns {Object[]} Crop recommendations in Firestore documents
   */
  async getSmsRecommendationsV2 ({ crop, stages, climateRisk, climateRiskKey = 'risk', activity, windSignal, collection, limit = 0 }) {
    if (!Object.values(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2).includes(collection)) {
      throw new Error('Invalid SNS recommendations collection name')
    }

    try {
      let docRef = db.collection(collection)

      if (crop !== undefined) {
        docRef = docRef.where('crop', '==', crop)
      }

      if (stages !== undefined) {
        docRef = docRef.where('crop_stage', 'in', stages)
      }

      if (activity !== undefined) {
        docRef = docRef.where('farming_activity', '==', activity)
      }

      if (windSignal !== undefined) {
        docRef = docRef.where('wind_signal', '==', windSignal)
      }

      if (limit > 0) {
        docRef = docRef.limit(limit)
      }

      if (climateRisk !== undefined) {
        const recommendationType = Object.keys(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2)
          .find(key => FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2[key] === collection)
          .toLocaleLowerCase()

        const risk = this.getClimateRiskCode(climateRisk, recommendationType)

        if (!risk) {
          throw new Error(`Unsupported climate risk: ${risk}`)
        }

        docRef = docRef.where(climateRiskKey, '==', risk)
      }

      // Quick fix: Fetch only one (1) document for special weather forecast for now
      // TO-DO: Assess further the Firestore structure for general special weather SMS text
      if (collection === FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2.SPECIAL) {
        docRef = docRef.limit(1)
      }

      const temp = await docRef.get()
        .then((snapshot) =>
          snapshot.docs.map((doc) =>
            doc.data()
          ))

      const smsText = temp.reduce((sms, item, index) => {
        sms += item.sms
        if (index < temp.length && sms.length > 0) sms += '\n\n'
        return sms
      }, '')

      return smsText.length > 0
        ? smsText
        : 'SMS text is not available'
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Return a list of text farm operations
   * @param {Object[]} list - List of farm operations contained in a "farm_activity" key following the format i.e.: [{ id, label, farm_activity, ... }...]
   * @returns {String[]} String array list of farm operations
   */
  getfarmoperationsV2 (list) {
    return list.map(item => item.farming_activity).filter((x, i, a) => a.indexOf(x) === i)
  }

  /**
   * Formats the 10-day recommendations for displaying in the current 10-day bulletin PDF's "Commodities" section
   * @param {Object[]} recommendations - Crop recommendations in Firestore documents
   * @param {Object} cropstagesByCrop - Unique crop stages list attached to a crop key
   * @returns {Object[]} List of crops with a list of unique crop stages and farm operations, i.e.:
   *    - [{ crop: "Rice", stages: ['stage1', 'stage2',...], farmoperations: ['farmoperation1',...] },...]
   */
  getcommoditiesV2 (recommendations, cropstagesByCrop) {
    return Object.keys(cropstagesByCrop).reduce((list, crop) => [...list, {
      crop,
      stages: cropstagesByCrop[crop].map(stage => stage.label)
        .filter((x, i, a) => a.indexOf(x) === i),
      farmoperations: recommendations.map(record => record.farming_activity)
        .filter((x, i, a) => a.indexOf(x) === i)
    }], [])
  }

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
  grouprecommendationsV2 (recommendations, farmoperations, uniqueCropStages) {
    let group = null
    const CROP_STAGE_CODES_V2 = [...uniqueCropStages]

    try {
      group = CROP_STAGE_CODES_V2.reduce((collections, stage) => {
        // Filter by farm operations
        farmoperations.forEach(activity => {
          // Crop stage text label
          const cropstageLabel = stage.label

          if (!cropstageLabel) {
            throw new Error('Undefined crop stage')
          }

          // Filtered recommendations
          const recs = recommendations.filter(recommendation =>
            recommendation.crop_stage === stage.code && recommendation.farming_activity === activity)

          if (recs.length > 0) {
            // Create a crop stage group
            if (collections[cropstageLabel] === undefined) {
              collections[cropstageLabel] = {}
            }

            if (collections[cropstageLabel][activity] === undefined) {
              collections[cropstageLabel][activity] = []
            }

            // Store the recommendation it its stage-activity group
            collections[cropstageLabel][activity] = [...collections[cropstageLabel][activity], ...recs]
          }
        })

        return collections
      }, {})
      return group
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Return and merge the HTML tags of crop recommendations of a certain "recommendationType" into one full HTML tag string
   * @param {Object} recommendationGroup - Recommendations grouped by crop stages then farm operations
   * @param {String} recommendationType - Recommendation key to retrieve from the recommendations row
   * @param {Object[]} params.cropStages - Ordered list of crop stages data found in `params.recommendationGroup`
   *    - Follows the format: `[{ id: 0, label: 'Maturing', code: 'mat'},...]`
   * @returns {String} HTML text containing all crop recommendations HTML tags
   */
  formatrecommendationsV2 ({ recommendationGroup, recommendationType, cropStages }) {
    try {
      const CROP_STAGE_NAMES_V2 = Object.values(cropStages)
        .map(item => item.label)

      const content = CROP_STAGE_NAMES_V2.reduce((htmlContent, stage) => {
        let subcontent = ''

        if (recommendationGroup[stage] !== undefined) {
          subcontent += `<h2>${stage}</h2>`
          Object.keys(recommendationGroup[stage]).forEach(activity => {
            subcontent += `<h3>${activity}</h3>`

            recommendationGroup[stage][activity].forEach(recommendation => {
              subcontent += recommendation[recommendationType]
            })
          })
        }

        if (subcontent !== '') {
          htmlContent += subcontent
        }

        return htmlContent
      }, '')

      return content
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Delete all Recommendation documents in the collection given a crop.
   * @param {String} crop - Crop property of a Recommendation document
   * @param {String} recommendationType - Recommendation key to retrieve from the recommendations row
  */
  async deleteRecommendationsV2 ({ collection, crop }) {
    if (!collection || !crop) return

    const docRef = db.collection(collection)
    const query = docRef.where('crop', '==', crop)

    const snapshot = await query.get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      return
    }

    // Create a batch to delete documents
    const batch = db.batch()

    snapshot.forEach(doc => {
      batch.delete(doc.ref)
    })

    // Commit the batch and return the Promise
    return await batch.commit()
  }

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
  async createGeneralRecommendation ({ type, recommendations, sms, uid, email }) {
    try {
      const params = {
        type,
        ...(recommendations && { recommendations }),
        ...(sms && { smsRecommendations: sms }),
        uid,
        updated_by: email,
        date_updated: admin.firestore.Timestamp.now()
      }

      // const docPath = FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.GENERAL
      const docRef = db.collection(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.GENERAL).doc(type)
      const doc = await docRef.get()

      if (!doc.exists) {
        return await docRef.set(params)
      } else {
        return await docRef.update(params)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = RecommendationsV2
