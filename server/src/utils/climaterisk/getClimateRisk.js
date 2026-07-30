// Original getClimateRisk.js copied from
// https://github.com/dilapitan/acap-rcmas-placeholder/blob/master/src/getClimateRisk.js

/**
 * Finds the climate risk from the consecutive `"condition"` value sequence/streaks count of a seasonal weather forecast data
 * @param {Object} countDistribution - Consecutive sequence/streaks count of `"condition"` values following the sample format:
 * ```javascript
 *  {
 *    'above_normal': [1],
 *    'b_normal': [2],
 *    'wb_normal': [3]
 *  }
 *  ```
 * @returns {String} seasonal weather forecast climate risk
 */
function getSeasonalDecision (countDistribution) {
  const belowNormal =
    (countDistribution?.b_normal.length ?? 0) > 0
      ? Math.max(...countDistribution.b_normal)
      : undefined
  const wayBelowNormal =
    (countDistribution?.wb_normal.length ?? 0) > 0
      ? Math.max(...countDistribution.wb_normal)
      : undefined
  const aboveNormal =
    (countDistribution?.above_normal.length ?? 0) > 0
      ? Math.max(...countDistribution.above_normal)
      : undefined

  const IS_DROUGHT =
    (belowNormal !== undefined && belowNormal === 5) ||
    (wayBelowNormal !== undefined && wayBelowNormal === 3)

  const IS_DRY_SPELL =
    (belowNormal !== undefined && belowNormal >= 3) ||
    (wayBelowNormal !== undefined && wayBelowNormal === 2)

  const IS_DRY_CONDITION = belowNormal !== undefined && belowNormal === 2

  // const IS_WETTER_CONDITION = aboveNormal !== undefined && aboveNormal >= 3
  const IS_WET_SPELL =
  (aboveNormal !== undefined && aboveNormal >= 3) ||
  (wayBelowNormal !== undefined && wayBelowNormal === 2)

  const IS_WET_CONDITION = aboveNormal !== undefined && aboveNormal === 2

  if (IS_DROUGHT) return 'Drought'
  if (IS_DRY_SPELL) return 'Dry Spell'
  if (IS_DRY_CONDITION) return 'Dry Condition'
  if (IS_WET_SPELL) return 'Wet Spell'
  if (IS_WET_CONDITION) return 'Wet Condition'
  return 'No Risk'
}

/**
 * Finds the climate risk from the consecutive `"rainfall"` value sequence/streaks count of a 10-day weather forecast data
 * @param {Object} countDistribution - Consecutive sequence/streaks count of `"rainfall"` values following the sample format:
 * ```javascript
 *  {
 *    'HEAVY RAINS': [1],
 *    'LIGHT RAINS': [],
 *    'MODERATE RAINS': [3],
 *    'NO RAIN': [1, 2, 3]
 *  }
 *  ```
 * @returns {String} 10-day weather forecast climate risk
 */
function getTenDayDecision (countDistribution) {
  const flooding_submergence_3M =
    (countDistribution['MODERATE RAINS']?.length ?? 0) > 0
      ? Math.max(...countDistribution['MODERATE RAINS'])
      : undefined
  const flooding_submergence_2H =
    (countDistribution['HEAVY RAINS']?.length ?? 0) > 0
      ? Math.max(...countDistribution['HEAVY RAINS'])
      : undefined
  const light_rains_10 =
    (countDistribution['LIGHT RAINS']?.length ?? 0) > 0
      ? Math.max(...countDistribution['LIGHT RAINS'])
      : undefined
  const dry_condition =
    (countDistribution['NO RAIN'].length ?? 0) > 0
      ? Math.max(...countDistribution['NO RAIN'])
      : undefined

  // const IS_FLOODING_SUBMERGENCE_3M =
  //   flooding_submergence_3M !== undefined && flooding_submergence_3M >= 3

  // const IS_FLOODING_SUBMERGENCE_2H =
  //   flooding_submergence_2H !== undefined && flooding_submergence_2H >= 2

  // const IS_DRY_CONDITION = dry_condition !== undefined && dry_condition === 10

  // if (IS_FLOODING_SUBMERGENCE_3M) return 'Flooding/Submergence 3M'
  // if (IS_FLOODING_SUBMERGENCE_2H) return 'Flooding/Submergence 2H'
  // if (IS_DRY_CONDITION) return 'Dry Condition'
  const IS_FLOODING_SUBMERGENCE_RISK =
    (flooding_submergence_3M !== undefined && flooding_submergence_3M >= 3) ||
    (flooding_submergence_2H !== undefined && flooding_submergence_2H >= 2)
  const IS_WATER_SHORTAGE_RISK =
    (light_rains_10 !== undefined && light_rains_10 === 10) ||
    (dry_condition !== undefined && dry_condition >= 5)

  if (IS_FLOODING_SUBMERGENCE_RISK) return 'Flooding/Submergence Risk'
  if (IS_WATER_SHORTAGE_RISK) return 'Water Shortage Risk'
  return 'No Risk'
}

/**
 * Seasonal weather forecast for a single month
 * @typedef {Object} SeasonalForecastItem
 * @property {string} condition - Seasonal weather forcecast condition
 * @property {string} mo - Shorthand month code
 * @property {number} year - Year in YYYY format
 */

/**
 * Counts the consecutive sequence/streak of `data.condition` values from a seasonal weather forecast data
 * @param {SeasonalForecastItem[]} data - Array of six (6) months seasonal PAGASA weather forecast data. Each array Object contains key-value pairs:
 *  - `condition` {string} - Seasonal weather forcecast condition. Valid values are `"above_normal"`, `"b_normal"` and `"wb_normal"`
 *  - `mo` {string} - Month code
 *  - `year` {number} - Year in YYYY format
 * @returns {Object} Formatted seasonal weather forecast data containing consecutive sequence/streaks count of `data.condition` values following the sample format:
 * ```javascript
 *  {
 *    above_normal: [1],
 *    b_normal: [],
 *    wb_normal: [3]
 *  }
 *  ```
 */
function useSeasonalData (data) {
  if (data.length === 0) return {}

  // TO-DO: Confirm -- no "near_normal"?
  const countDistribution = {
    wb_normal: [],
    b_normal: [],
    above_normal: [],
    // Insert: near_normal
    near_normal: []
  }
  let currentCondition = data[0].condition
  let count = 1

  for (let i = 1; i < data.length; i++) {
    if (data[i].condition === currentCondition) {
      count++
    } else {
      countDistribution[currentCondition].push(count)

      currentCondition = data[i].condition
      count = 1
    }
  }

  // Add the last sequence to the countDistribution
  countDistribution[currentCondition].push(count)

  return getSeasonalDecision(countDistribution)
}

/**
 * 10-day weather forecast for a single day in one of the 10 day data items
 * @typedef {Object} TendayForecastItem
 * @param {number} day - Day number in the 10-day date range
 * @param {string} day_format - Formatted date in i.e., "Mon Jan 19" format
 * @param {string} day_str - String formatted date in YYYY/MM/DD format
 * @param {string} rainfall - 10-day weather forcecast condition
 */

/**
 * Counts the consecutive sequence/streak of `data.rainfall` values from a 10-day weather forecast data
 * @param {TendayForecastItem[]} data - 10-Day PAGASA weather forecast data. Each array Object contains key-value pairs:
 * - `day` {number} - Day number in the 10-day date range
 * - `day_format` {string} - Formatted date in i.e., "Mon Jan 19" format
 * - `day_str` {string} - String formatted date in YYYY/MM/DD format
 * - `rainfall` {string} - 10-day weather forcecast condition. Valid values are: `"HEAVY RAINS"`, `"LIGHT RAINS"`, `"MODERATE RAINS"`, `"NO RAIN"`
 * @returns {Object} Formatted 10-day weather forecast data containing consecutive sequence/streaks count of `data.rainfall` values following the sample format:
 * ```javascript
 *  {
 *    'HEAVY RAINS': [1],
 *    'LIGHT RAINS': [],
 *    'MODERATE RAINS': [3],
 *    'NO RAIN': [1, 2, 3]
 *  }
 *  ```
 */
function useTenDay (data) {
  if (data.length === 0) return {}

  const countDistribution = {
    'NO RAIN': [],
    'MODERATE RAINS': [],
    'HEAVY RAINS': [],
    'LIGHT RAINS': []
  }

  let currentRainfall = data[0].rainfall
  let count = 1

  for (let i = 1; i < data.length; i++) {
    if (data[i].rainfall === currentRainfall) {
      count++
    } else {
      countDistribution[currentRainfall].push(count)

      currentRainfall = data[i].rainfall
      count = 1
    }
  }

  // Add the last sequence to the countDistribution
  countDistribution[currentRainfall].push(count)

  return getTenDayDecision(countDistribution)
}

/**
 * Finds the climate risk from a set of seasonal or 10-day weather forecast data
 * @param {String} recommendationsType - Crop recommendation type. One of tenday|seasonal
 * @param {(SeasonalForecastItem[]|TendayForecastItem[])} weatherData - Seasonal or 10-day weather forecast data
 * @returns {String} Climate risk derived from a set of seasonal or 10-day weather forecast data
 */
function getClimateRisk (recommendationsType, weatherData) {
  // Assumption here is ONE Climate Risk per Seasonal or TenDay

  switch (recommendationsType) {
    case 'seasonal':
      return useSeasonalData(weatherData)
    case 'tenday':
      return useTenDay(weatherData)
    default:
      break
  }
}

module.exports = {
  getClimateRisk
}
