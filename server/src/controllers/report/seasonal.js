const createNewSeasonalReport = require('../../classes/report/scripts/createnewseasonalscript')
const { deletereport } = require('../../classes/report')

// Create a Report document. Also creates the global Bulletin document and PDF file.
module.exports.createReport = async (req, res, next) => {
  const {
    region,
    province,
    // municipality,
    crop,
    month,
    climateRisk,
    cropping_calendar,
    stages,
    recommendations,
    activities,
    services,
    isFull = false,
    operation,
    language = 'en'
  } = req.body
  const user = req.user

  try {
    const report = await createNewSeasonalReport({
      REGION_LOCATIONS: req.REGION_LOCATIONS,
      region,
      province,
      // municipality,
      crop,
      month,
      operation,
      language,
      isFull,
      user,
      // New added params
      climateRisk,
      cropping_calendar,
      stages,
      recommendations,
      activities,
      services,
      //
      res,
      origin: req?.headers?.origin
    })

    if (operation === 'create') {
      return res.status(200).send(report)
    } else if (operation === 'preview') {
      // PDF blob or errors are sent to "res" from createSeasonalReport()
      return
    } else {
      return res.status(200).send('Finished')
    }
  } catch (err) {
    return next(new Error(err.message))
  }
}

// Delete a Report document
module.exports.deleteReport = async (req, res, next) => {
  const { docId } = req.body

  if (!docId) {
    return res.status(500).send('Missing document ID.')
  }

  try {
    await deletereport(docId)
    return res.status(200).send({
      id: docId,
      message: 'Report deleted.'
    })
  } catch (err) {
    next(new Error(err))
  }
}
