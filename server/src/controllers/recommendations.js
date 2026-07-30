const { CsvToFireStore } = require('csv-firestore')

const TendayTabV2 = require('../scripts/seeders/13_recommendations/classes/tendaytabv2')
const TendayTabSMS = require('../scripts/seeders/13_recommendations/classes/tendaytabSMS_v3')
const SeasonalTabV2 = require('../scripts/seeders/13_recommendations/classes/seasonaltabv2')
const SeasonalTabGeneral = require('../scripts/seeders/13_recommendations/classes/seasonaltabgeneral')
const SeasonalTabSMS = require('../scripts/seeders/13_recommendations/classes/seasonaltabSMS')
const SpecialTabV2 = require('../scripts/seeders/13_recommendations/classes/specialtabv2')
const SpecialTabSMS = require('../scripts/seeders/13_recommendations/classes/specialtabSMS')

const { extractExcelData } = require('../scripts/seeders/13_recommendations/lib/extractv2')
const { delFile } = require('../utils/file')
const { deleteRecommendationsV2 } = require('../classes/recommendations_v2/')
const { getcropcalstagesdataV2, getcropcalstagesseasonal } = require('../classes/calendar_v2')

const uploadCropRecommendationsExcel = async (req, res, next) => {
  try {
    const { cropName } = req.params
    const data = []
    const query = []
    const queryDelete = []
    let cropStages = []
    let cropStagesSeasonal = []

    if (!cropName) {
      res.send({ message: 'Missing crop input.' })
      return
    }

    const excelFilePath = req.file.path

    // Fetch cropping calendar stages for reference
    const stages = await getcropcalstagesdataV2(cropName)
    const stagesSeasonal = await getcropcalstagesseasonal(cropName)

    if (!stages && !stagesSeasonal) {
      throw new Error('Crop stages not set')
    } else {
      cropStages = Object.values(stages).reduce((list, item) => {
        return { ...list, [item.label.trim()]: item.code }
      }, {})

      cropStagesSeasonal = Object.values(stagesSeasonal).reduce((list, item) => {
        return { ...list, [item.label.trim()]: item.code }
      }, {})
    }

    // Firestore documents upload handler
    const handler = new CsvToFireStore()

    // Excel tabs column names definitions
    const excelTabs = [
      new TendayTabV2(cropName, cropStages),
      new TendayTabSMS(cropName),
      new SeasonalTabV2(cropName, cropStages),
      new SeasonalTabGeneral(cropStagesSeasonal),
      new SeasonalTabSMS(cropName),
      new SpecialTabV2(cropName),
      new SpecialTabSMS(cropName)
    ]

    excelTabs.forEach((item) => {
      data.push(extractExcelData(item, excelFilePath, cropName))
    })

    data.forEach((item) => {
      queryDelete.push(deleteRecommendationsV2({
        collection: `n_crop_recommendations_${item.recommendations.type}`,
        crop: cropName
      }))
    })

    // Finish deleting existing data first (avoid race conditions)
    await Promise.all(queryDelete)

    data.forEach((item) => {
      // Path: /n_list_crop_recommendations_{type}
      query.push(handler.firestoreUpload(
        `n_crop_recommendations_${item.recommendations.type}`,
        false,
        item.recommendations.data
      ))
    })

    // Then upload new data
    await Promise.all(query)

    // Clean-up: Delete uploaded file
    await delFile(excelFilePath)

    return res.send({ message: `Successfully uploaded ${cropName} recommendations!` })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  uploadCropRecommendationsExcel
}
