const { db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS } = require('../../utils/constants')
const { CROP_STAGE_NAMES, CROP_STAGE_CODES, CROP_STAGE_LABELS } = require('../calendar/constants')

class Recommendations {
  /**
   * Fetch crop recommendations from a designated Firestore collection (seasonal, 10-day, special weather) based from given parameters.
   * @param {String[]} stages - Crop stages
   * @param {String} forecast - Weather forecast (rainfall amount)
   * @param {String} collection - Firestore collection name. One of FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS.
   * @param {Number} limit - Number of documents to return from the query
   * @returns {Object[]} Crop recommendations in Firestore documents
   */
  async getrecommendations ({ stages, forecast, collection, limit = 0 }) {
    if (!Object.values(FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS).includes(collection)) {
      throw new Error('Invalid recommendations collection name')
    }

    try {
      let docRef = db.collection(collection)

      if (stages !== undefined) {
        docRef = docRef.where('crop_stage', 'in', stages)
      }

      if (forecast !== undefined) {
        docRef = docRef.where('forecast', '==', forecast)
      }

      if (limit > 0) {
        docRef = docRef.limit(limit)
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
   * Return a list of text farm operations
   * @param {Object[]} list - List of farm operations contained in a "farm_operation" key following the format i.e.: [{ id, label, farm_operation, ... }...]
   * @returns {String[]} String array list of farm operations
   */
  getfarmoperations (list) {
    return list.map(item => item.farm_operation).filter((x, i, a) => a.indexOf(x) === i)
  }

  /**
   *
   * @param {Object[]} recommendations - Crop recommendations in Firestore documents
   * @param {Object} cropstagesByCrop - Unique crop stages list attached to a crop key
   * @returns {Object[]} List of crops with a list of unique crop stages and farm operations, i.e.:
   *    - [{ crop: "Rice", stages: ['stage1', 'stage2',...], farmoperations: ['farmoperation1',...] },...]
   */
  getcommodities (recommendations, cropstagesByCrop) {
    return Object.keys(cropstagesByCrop).reduce((list, crop) => [...list, {
      crop,
      stages: cropstagesByCrop[crop].map(stage => stage.label)
        .filter((x, i, a) => a.indexOf(x) === i),
      farmoperations: recommendations.map(record => record.farm_operation)
        .filter((x, i, a) => a.indexOf(x) === i)
    }], [])
  }

  /**
   * Groups recommendations Firestore documents into groups of crop stages and farm operations
   * @param {Object[]} recommendations - A collection of Firestore documents containing crop recommendations
   * @param {String[]} farmoperations - Unique list of farm operations from the recommendations
   * @returns {Object} Recommendations with crop stages as keys. Each crop stage contains farm operations as keys, and each farm operation contains an array of recommendations i.e.:
   *    {
   *       "Newly-Planted": {
   *          "Planting/Transplanting": [{ id: 0, crop_stage, farm_operation, practice,... }...],
   *          ...
   *       },
   *       "Vegetative/Reproductive": {
   *          "Fertlizer Application": [{ id: 0, crop_stage, farm_operation, practice,... }...],
   *          "Pest and Weed Management": [{ id: 0, crop_stage, farm_operation, practice,... }...],
   *          ...
   *       },
   *       ...
   *    }
   */
  grouprecommendations (recommendations, farmoperations) {
    let group = null

    try {
      group = CROP_STAGE_CODES.reduce((collections, stage) => {
        // Filter by farm operations
        farmoperations.forEach(activity => {
          // Crop stage text label
          const cropstageLabel = CROP_STAGE_LABELS[stage]

          if (!cropstageLabel) {
            throw new Error('Undefined crop stage')
          }

          // Filtered recommendations
          const recs = recommendations.filter(recommendation =>
            recommendation.crop_stage === stage && recommendation.farm_operation === activity)

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
   * @returns {String} HTML text containing all crop recommendations HTML tags
   */
  formatrecommendations ({ recommendationGroup, recommendationType }) {
    try {
      const content = CROP_STAGE_NAMES.reduce((htmlContent, stage) => {
        let subcontent = ''

        if (recommendationGroup[stage] !== undefined) {
          Object.keys(recommendationGroup[stage]).forEach(activity => {
            subcontent += `<h2>${stage} - ${activity}</h2>`

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
   * Removes duplicate recommendations in the impacts (seasonal) recommendations and merges all impacts recommendations HTML items into (1) HTML unordered list.
   * @param {Object[]} recommendations - Unsorted and unfiltered Firestore documents containing crop recommendations
   * @param {Object} impactOutlookKeys - (Optional) Crop recommendation Firestore doc field keys of the Impact Outlook tagalog and english version. Default value is: `{ en: 'impact', tag: 'impact_tagalog' }`
   * @param {String} impactOutlookKeys.en - Crop recommendation field key of the Impact Outlook english translation
   * @param {String} impactOutlookKeys.tag - Crop recommendation field key of the Impact Outlook tagalog translation
   * @returns {Object} Unique text Impact Oulook recommendations { impact, impact_tagalog }
   *    - impact: {String} HTML tags text of unique impact outlook recommendations merged into (1) long HTML list
   *    - impact_tagalog: {String} Tagalog version on impact
   */
  grouprecommendationsimpacts (recommendations,
    // 20240528: Provide support for v2 Firestore fields naming conventions
    impactOutlookKeys = { en: 'impact', tag: 'impact_tagalog' }) {
    const group = {}

    try {
      // Extract "impact" and "impact_tagalog" keys that have values
      const impacts = recommendations.map(recommendation => ({
        impact: recommendation[impactOutlookKeys.en],
        impact_tagalog: recommendation[impactOutlookKeys.tag]
      })).filter(item => item.impact !== '' && item.impact_tagalog !== '')

      const itemizedImpacts = this.itemizeUniqueHTMLTextForImpacts(impacts)

      group.impact = this.buildHTMLStringForImpacts(itemizedImpacts.impact)
      group.impact_tagalog = this.buildHTMLStringForImpacts(itemizedImpacts.impact_tagalog)

      return group
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Builds a list of text to HTML tags
   * @param {String[]} list
   * @returns
   */
  buildHTMLStringForImpacts (list) {
    let container = '-'

    let htmlText = list.reduce((processed, item) => {
      if (item.includes('<p>')) {
        if (container === 'list') {
          processed += '</ul>'
        }
        processed += item
        container = 'p'
      } else {
        if (['-', 'p'].includes(container)) {
          processed += '<ul>'
        }

        processed += item
        container = 'list'
      }

      return processed
    }, '')

    if (container === 'list') {
      htmlText += '</ul>'
    }

    return htmlText
  }

  /**
   * Tokenizes/breaks down a series of <li> and <p> tags from HTML strings into array items and removes duplicate text
   * @param {Object[]} impacts - Crop recommendations from Firestore documents containing the "impact" and "impact_tagalog" keys only
   * @returns {String[]} Unique list of recommendation items in <li> or <p> HTML tags
   */
  itemizeUniqueHTMLTextForImpacts (impacts) {
    // 20240528: Consider cases where the tagalog set of recommendations is exactly the same as the eng version or vice-versa
    const list = {
      impact: [],
      impact_tagalog: []
    }

    return impacts.reduce((store, item) => {
      Object.keys(store).forEach(key => {
        let string = item[key].replace(/<ul>/g, '')
        string = string.replace(/<\/ul>/g, '')
        string = string.replace(/<li>/g, '')

        string.split('</li>').forEach(item => {
          // Check for text in <p>
          if (item.includes('<p>')) {
            const pString = item.replace(/<p>/g, '')
            const pItems = pString.split('</p>')

            pItems.forEach(pText => {
              if (!list[key].includes(pText) && pText !== '') {
                list[key].push(pText)
                store[key].push(`<p>${pText}</p>`)
              }
            })
          } else {
            // Regular list item
            if (!list[key].includes(item) && item !== '') {
              list[key].push(item)
              store[key].push(`<li>${item}</li>`)
            }
          }
        })
      })

      return { ...store }
    }, { impact: [], impact_tagalog: [] })
  }

  /**
   * Returns a list of unique farm operations (activities) from a set of crop recommendations documents
   * @param {Object[]} documents - Firestore documents containing crop recommendations
   * @returns {String[]} List of unique farm operations
   */
  listactivities (documents) {
    return documents.map(x => x.activity).filter((x, i, a) => a.indexOf(x) === i)
  }
}

module.exports = Recommendations
