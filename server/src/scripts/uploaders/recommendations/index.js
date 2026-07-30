const path = require('path')
const { processRecommendations } = require('../../seeders/13_recommendations/lib/process')
const getargs = require('../../../utils/getargs')

// Usage: Put a valid recommendations excel file in this script's directory then run
// npm run upload:recommendations --localfilename=<excel_file>.xlsx
const main = async () => {
  try {
    const args = getargs(['localfilename'])

    await processRecommendations({
      localfile: path.join(__dirname, args.localfilename),
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
