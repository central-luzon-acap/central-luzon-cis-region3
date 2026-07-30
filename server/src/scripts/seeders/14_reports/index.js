const createSeasonalReport = require('../../../classes/report/scripts/createseasonalscript')
const { getmunicipalitiesreference } = require('../../../classes/municipalities')

/**
 * Automates mass creation of seasonal Reports, Bulletins and PDF files (max 6).
 * @param {String} region - Region name
 * @param {String} province - Province name
 * @param {String} municipality - Municipality name
 * @param {String} months - Comma-separated month codes included in the current (6) seasonal months i.e., jan,feb,mar,... dec
 * @param {String} crop - Crop name
 * @param {String} language - Crop recommendations language (en, tag)
 * Usage: Run the npm script with the required input parameters.
 * npm run seed:reports --region=bicol --province=Catanduanes --municipality=Baras --months=nov,dec,jan --crop=Rice --language=tag
 */
const main = async () => {
  const params = ['region', 'province', 'municipality', 'months', 'crop', /* 'operation', */ 'language']
  const queries = []
  let REGION_LOCATIONS = {}

  // Get the cli input parameter values
  const values = params.reduce((collection, param) => {
    if (process.env[`npm_config_${param}`] !== undefined) {
      if (param === 'months') {
        collection[param] = process.env[`npm_config_${param}`].split(',')
      } else {
        collection[param] = process.env[`npm_config_${param}`]
      }
    }

    return { ...collection }
  }, {})

  // Check input parameters
  params.forEach(param => {
    if (values[param] === undefined) {
      console.log(`Missing [${param}] parameter.`)
      process.exit(1)
    }
  })

  // Create a mock user
  const user = { uid: '-', email: 'system' }

  try {
    // Load the municipalities reference
    const doc = await getmunicipalitiesreference()
    REGION_LOCATIONS = (doc.exists)
      ? doc.data()?.data ?? []
      : []
  } catch (err) {
    throw new Error(err.message)
  }

  // Push async queries in an array
  values.months.forEach(month => {
    queries.push(createSeasonalReport({ ...values, REGION_LOCATIONS, month, user }))
  })

  try {
    console.log(`[PROCESS] Creating seasonal recommendations for ${values.province}, ${values.municipality}\non months ${values.months.toString().split(',').join(', ')}`)
    await Promise.all(queries)

    console.log('[PROCESS] Done.')
    process.exit(0)
  } catch (err) {
    console.log(`[ERROR] ${err.message}`)
    process.exit(1)
  }
}

main()
