function getSeasonalDecision(countDistribution) {
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

  const IS_WET_SPELL =
  (aboveNormal !== undefined && aboveNormal >= 3) ||
  (wayBelowNormal !== undefined && wayBelowNormal === 2)

  const IS_WET_CONDITION = aboveNormal !== undefined && aboveNormal === 2

  if (IS_DROUGHT) return { label: 'Drought', code: 'drought' }
  if (IS_DRY_SPELL) return { label: 'Dry Spell', code: 'dry_spell' }
  if (IS_DRY_CONDITION) return { label: 'Dry Condition', code: 'dry_condition' }
  if (IS_WET_SPELL) return { label: 'Wet Spell', code: 'wet_spell' }
  if (IS_WET_CONDITION) return { label: 'Wet Condition', code: 'wet_condition' }
  return { label: 'No Risk', code: 'no_risk' }
}

function getTenDayDecision(countDistribution) {
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

  // if (IS_FLOODING_SUBMERGENCE_3M) return { label: 'Flooding/Submergence 3M', code: 'flooding_submergence_3M' }
  // if (IS_FLOODING_SUBMERGENCE_2H) return { label: 'Flooding/Submergence 2H', code: 'flooding_submergence_2H' }
  // if (IS_DRY_CONDITION) return { label: 'Dry Condition', code: 'dry_condition' }
  const IS_FLOODING_SUBMERGENCE_RISK =
    (flooding_submergence_3M !== undefined && flooding_submergence_3M >= 3) ||
    (flooding_submergence_2H !== undefined && flooding_submergence_2H >= 2)
  const IS_WATER_SHORTAGE_RISK =
    (light_rains_10 !== undefined && light_rains_10 === 10) ||
    (dry_condition !== undefined && dry_condition >= 5)

  if (IS_FLOODING_SUBMERGENCE_RISK) return { label: 'Flooding/Submergence Risk', code: 'flooding_submergence_risk' }
  if (IS_WATER_SHORTAGE_RISK) return { label: 'Water Shortage Risk', code: 'water_shortage_risk' }
  return { label: 'No Risk', code: 'no_risk' }
}

function _useSeasonalData(data) {
  if (data.length === 0) return {}

  let countDistribution = {
    wb_normal: [],
    b_normal: [],
    above_normal: [],
    near_normal: []
  }
  let currentCondition = data[0].con
  let count = 1

  for (let i = 1; i < data.length; i++) {
    if (data[i].con === currentCondition) {
      count++
    } else {
      countDistribution[currentCondition].push(count)

      currentCondition = data[i].con
      count = 1
    }
  }

  // Add the last sequence to the countDistribution
  countDistribution[currentCondition].push(count)

  return getSeasonalDecision(countDistribution)
}

function _useTenDay(data) {
  if (data.length === 0) return {}

  let countDistribution = {
    'NO RAIN': [],
    'MODERATE RAINS': [],
    'HEAVY RAINS': [],
    'LIGHT RAINS': [],
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

const getClimateRisk = (data, recommendationsType) => {
  switch (recommendationsType) {
    case 'seasonal':
      return _useSeasonalData(data)
    case 'tenday':
      return _useTenDay(data)
    default:
      break
  }
}

export default getClimateRisk
