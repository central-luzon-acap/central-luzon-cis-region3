const path = require('path')
const TendayExcel = require('../classes/tendayexcel')
const ExcelAdapter = require('../classes/exceladapter/exceladapter')
const { createTempDir, delDir } = require('../../../../utils/dir')
const {
  upsertrawmunicipalities,
  upsertformattedmunicipalities,
  upsertmunicipalitiesdiff
} = require('../../../../classes/municipalities')
const { logError, createSharedForecast, DATA_TYPE } = require('./log')
const { REGION } = require('./constants')
const { PROVINCE_LIST } = require('../../../../utils/constants')

/**
 * Loads a PAGASA 10-day weather forecast data from an excel file on disk storage or via download URL.
 * Updates the provinces and municipalities masterlist Firestore documents with new municipality names from the excel file.
 * @param {String} localfile - Full file path to 10-day weather forecast excel file. Ommitting this param will download a fresh excel file to a temporary directory.
 * @param {Bool} shouldUpdate - Flag to update the provinces and municipalities masterlist Firestore documents with new data from the excel file. Default is false.
 * @param {Bool} returnParser - Flag to include a BicolExcel instance on the return output. Default is false.
 * @param {Bool} deleteTempDir - Flag to delete the temporary excel file download directory and contents. Default is true.
 * @returns {Object} { dirPath, BicolExcel, REGION_LOCATIONS }
 *    - dirPath: {String} Full path of the temporary directory for the downloaded excel file
 *    - forecast: {Object} Raw and formatted weather forecast municipalities list
 *    - BicolExcel: {BicolExcel} BicolExcel excel parser instance containing parsed excel file data
 *    - REGION_LOCATIONS: {Object} Object containing metadata and the raw provinces and municipalities list, grouped by province
 *      - REGION_LOCATIONS.metadata: {Object}
 *      - REGION_LOCATIONS.data: {Object} i.e., { "Albay": ["Tiwi", "Bacacay",...], "Masbate": ["Baleno", "Balud"] }
 */
const initialize = async ({
  localfile,
  shouldUpdate = false,
  returnParser = false,
  deleteTempDir = true
}) => {
  let BicolExcel
  let REGION_LOCATIONS = {}
  let tempDirPath = null
  const forecast = {}

  if (!localfile) {
    tempDirPath = createTempDir()

    if (!tempDirPath) {
      throw new Error('Error creating a temporary directory')
    }
  }

  try {
    let PAGASAMUnicipalities

    if (localfile) {
      // Uses old, static municipalities data
      PAGASAMUnicipalities = new ExcelAdapter({
        pathToFile: localfile
      })

      console.log('[10-DAY EXCEL]: Using a local file from disk')
    } else {
      // Downloads a fresh, new municipalities data from a remote PAGASA excel file
      PAGASAMUnicipalities = new ExcelAdapter({
        pathToFile: path.join(tempDirPath, 'pagasamunicipalities.xlsx'),
        url: `${process.env.PAGASA_10DAY_EXCEL_BASE_URL}/day1.xlsx`
      })

      console.log('[10-DAY EXCEL]: Downloading an excel file...')
      await PAGASAMUnicipalities.init()
    }

    REGION_LOCATIONS = PAGASAMUnicipalities.shapeJsonData(PROVINCE_LIST)

    if (shouldUpdate) {
      console.log('[10-DAY EXCEL]: Updating provinces and municipalities lists...')

      // Upate the raw provinces and municipalities reference
      await upsertrawmunicipalities(REGION_LOCATIONS)

      // Update the formatted provinces and municipalities reference used for drop-down menus
      await upsertformattedmunicipalities(
        PAGASAMUnicipalities.shaperegionlocationsdata(REGION_LOCATIONS)
      )

      // Reset the municipality names difference
      await upsertmunicipalitiesdiff([])
    }

    // Create the PAGASA excel file checker utility
    if (returnParser) {
      BicolExcel = new TendayExcel({
        regionName: REGION,
        provinces: PROVINCE_LIST,
        municipalities: PAGASAMUnicipalities.getmunicipalitieslist(REGION_LOCATIONS.data)
      })
    }

    // Create the municipalities long-list
    forecast.municipalities = PAGASAMUnicipalities.longlistmunicipalities(PROVINCE_LIST)
    forecast.formatted = PAGASAMUnicipalities.shaperegionlocationsdata(PAGASAMUnicipalities.shapeJsonData(PROVINCE_LIST))

    if (!localfile && deleteTempDir) {
      await delDir(tempDirPath)
    }

    console.log('Initialized.')
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
    await logError(err.message)
    await createSharedForecast({ region: REGION, type: DATA_TYPE.ERROR })

    process.exit(1)
  }

  return {
    dirPath: tempDirPath,
    forecast,
    BicolExcel,
    REGION_LOCATIONS
  }
}

module.exports = initialize
