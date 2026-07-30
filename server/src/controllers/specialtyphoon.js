const {
  scrapecycloneinfo,
  setcycloneinformation,
  getcycloneinformation
} = require('../classes/cyclone_advisory')

const {
  upsertspecialregional,
  getspecialregionaldoc
} = require('../classes/regionalspecial')

const {
  archiveSpecialWeatherForecast,
  archiveAffectedMunicipalities
} = require('../classes/sharedweatherforecast/special')

const { FIRESTORE_DOCUMENTS } = require('../utils/constants')

// Call the special weather forecast web scrapper method
module.exports.updateSpecialTyphoon = async (req, res, next) => {
  const user = req.user
  let data

  try {
    // Archive the latest "active" special weather forecast if its bulletin # does not yet exist in the archives
    if (process.env.IS_RMCAS_API_ACTIVE === '1') {
      await archiveSpecialWeatherForecast()
    }
  } catch (err) {
    console.log(`[WARNING-ARCHIVING]: ${err.message}`)
  }

  try {
    data = await scrapecycloneinfo()
    data = {
      ...data,
      email: user.email,
      updated_by: user.uid
    }
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Upload empty or cyclone-filled scraped data to Firestore
    await setcycloneinformation(data)
  } catch (err) {
    return next(new Error(err))
  }

  try {
    const latest = await getcycloneinformation()
    return res.status(200).json(latest.data())
  } catch (err) {
    return next(new Error(err))
  }
}

// Update the global (common) special weather forecast data
module.exports.updateSpecialTyphoonRegional = async (req, res, next) => {
  const { data, region, type } = req.body

  try {
    // Upsert the common special weather weather forecast wind speed data
    await upsertspecialregional({
      region,
      documentName: type,
      data,
      user: {
        email: req.user.email,
        id: req.user.user_id
      }
    })
  } catch (err) {
    return next(new Error(err))
  }

  // Update the archived special weather forecast data with affected municipalities
  if (
    type === FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED &&
    process.env.IS_RMCAS_API_ACTIVE === '1'
  ) {
    try {
      await archiveAffectedMunicipalities(data)
    } catch (err) {
      return next(new Error(err))
    }
  }

  try {
    // Fetch and return the newly-created or updated document
    const doc = await getspecialregionaldoc({
      region,
      documentName: type
    })

    if (!doc.exists) {
      return next(new Error('Failed to fetch common data.'))
    } else {
      return res.status(200).send(doc.data())
    }
  } catch (err) {
    return next(new Error(err))
  }
}
