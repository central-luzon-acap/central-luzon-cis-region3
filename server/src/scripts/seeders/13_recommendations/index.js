const path = require('path')
const { processRecommendations } = require('./lib/process')
const getargs = require('../../../utils/getargs')

/**
 * Parses and uploads the contents of the crop recommendations EXCEL file to Firestore,
 * with an option to use ACAP-Bicol's original, final crop recommendations or a placeholder values.
 *
 * Usage: Run this script as an NPM script under the package.json's "scripts" section.
 * Example usage:
 *  - npm run seed:13_recommendations --mock
 *  - npm run seed:13_recommendations --mock=false
 */
const main = async () => {
  const args = getargs(['mock'])

  try {
    await processRecommendations({
      localfile: (args.mock === 'true')
        ? path.join(__dirname, '..', '..', 'data', 'mock_recommendations_html_v2.xlsx')
        : path.join(__dirname, '..', '..', 'data', 'recommendations_html_acap_bicol.xlsx'),
      logsdir: __dirname,
      upload: true,
      write: true
    })
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

main()
