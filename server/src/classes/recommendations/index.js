const Recommendations = require('./recommendations')
const RE = new Recommendations()

const getrecommendations = RE.getrecommendations.bind(RE)
const grouprecommendations = RE.grouprecommendations.bind(RE)
const getcommodities = RE.getcommodities.bind(RE)
const getfarmoperations = RE.getfarmoperations.bind(RE)
const formatrecommendations = RE.formatrecommendations.bind(RE)

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
const grouprecommendationsimpacts = RE.grouprecommendationsimpacts.bind(RE)

const listactivities = RE.listactivities.bind(RE)

module.exports = {
  getrecommendations,
  grouprecommendations,
  getcommodities,
  getfarmoperations,
  formatrecommendations,
  grouprecommendationsimpacts,
  listactivities
}
