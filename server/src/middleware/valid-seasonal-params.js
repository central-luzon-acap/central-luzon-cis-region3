const {
  validSeasonalMonths,
  validSeasonalRegion
} = require('../utils/validators')

const { PROVINCES } = require('../utils/constants')

// Validate parameters for the /api/weather/seasonal/province endpoint
module.exports.validSeasonalProvinceData = async (req, res, next) => {
  const { region, province, months } = req.body

  if (!region || !province || !months) {
    return res.status(500).send('Missing parameter/s')
  }

  if (!PROVINCES[region]) {
    return res.status(500).send('Invalid region name.')
  }

  if (!PROVINCES[region].includes(province)) {
    return res.status(500).send('Province does not belong to region.')
  }

  try {
    validSeasonalMonths(months)
  } catch (err) {
    return res.status(500).send(err.message)
  }

  next()
}

// Validate parameters for the /api/weather/seasonal/region endpoint
module.exports.validSeasonalRegionData = async (req, res, next) => {
  const { region, provinces } = req.body

  if (!region || !provinces) {
    return res.status(500).send('Missing parameter/s')
  }

  try {
    validSeasonalRegion(region, provinces)
  } catch (err) {
    return res.status(500).send(err.message)
  }

  next()
}
