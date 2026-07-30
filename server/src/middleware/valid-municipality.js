const { getmunicipalitiesreference } = require('../classes/municipalities')

// Injects the latest calendar and 10-day weather synced municipalities list to the "req" object
module.exports.validMunicipalities = async (req, res, next) => {
  try {
    const doc = await getmunicipalitiesreference()

    req.REGION_LOCATIONS = (doc.exists)
      ? doc.data()?.data ?? []
      : []

    next()
    return
  } catch (err) {
    return next(new Error(err))
  }
}
