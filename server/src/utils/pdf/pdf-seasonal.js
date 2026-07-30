const path = require('path')
const ejs = require('ejs')
const template = require('./lib/template')
const { imageToBase64 } = require('./lib/image')
const { loadEnsoData, seasonalForecastData } = require('./data')

/**
 * HTML, CSS and Image files definition for the Seasonal PDF template
 * @typedef {Object} params - Input parameters
 * @param {Object} params.recommendationsByStage - Recommendations with crop stages as keys. Each crop stage group contains farm operations as keys,
 *    and each farm operation contains a series of `<ol>`, `<ul>`, `<li>`, `<p>` formatted HTML tags recommendations
 * @param {Object} params.recommendationsImpacts - Impact Outlook recommendations as formatted HTML tags
 * @param {String} params.mainTitle - Crop recommendations title using the province, municipality and crop input parameters i.e., `"Albay, Bacacay - Rice"`
 * @param {String[]} params.farmOperations - List of farm operations across all crop stages
 * @param {String} params.language - Language translation. One of "en", "tag" where en=English and tag=Tagalog
 * @param {Bool} params.isFull - Flag to use CSS styles and JavaScript for an ideally longer than usual recommendations list to "overflow" to more than 1 page, usually reserved when considering full six (6) months worth of the active seasonal months. Defaults to "false"
 * @returns {String} html - HTML string containing remote relevant data and all image references converted to base64
 * @returns {String[]} css - List of full-path CSS files used in the HTML file
 * @returns {String[]} js - List of full-path JS files used in the HTML file
 */
const seasonalTemplatePDF = async ({
  recommendationsByStage,
  recommendationsImpacts,
  hasProvincial,
  mainTitle,
  farmOperations,
  services,
  language = 'en',
  isFull = false,
  province,
  crop
}) => {
  let ensoData = []
  let ensoImgDialBase64 = ''
  let ensoImgMiscBase64 = ''
  let seasonalForecastTableData = []
  let seasonalTableData = []
  let weatherSystemsData = []
  let monthsHeaders = []
  let seasonalCoverage = ''
  let html = ''

  // Full-path list of images used in the HTML file
  const images = [
    path.resolve(
      __dirname,
      'livereload',
      'public',
      'common',
      'images',
      'da-logo.png'
    ),
    path.resolve(
      __dirname,
      'livereload',
      'public',
      'common',
      'images',
      'amia-logo.png'
    ),
    path.resolve(
      __dirname,
      'livereload',
      'public',
      'common',
      'images',
      'rice-logo.png'
    ),
    path.resolve(
      __dirname,
      'livereload',
      'public',
      'common',
      'images',
      'corn-logo.png'
    )
  ]

  // Practices images file paths
  for (let i = 1; i <= 5; i += 1) {
    images.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        'images',
        `practices-0${i}.png`
      )
    )
  }

  // Load the HTML file
  html = template(
    path.resolve(__dirname, 'templates', 'pdf-seasonal.ejs'),
    images,
    'images'
  )

  // Keep track of CSS file paths
  const css = []
  const miscCss = ['times-new-roman.css', 'normalize.css']
  miscCss.forEach((cssFile) => {
    css.push(path.resolve(__dirname, 'livereload', 'public', 'common', cssFile))
  })

  // Keep track of JS script paths
  let js = [
    path.resolve(__dirname, 'livereload', 'public', 'seasonal', 'fit-text.js')
  ]

  for (let i = 0; i <= 3; i += 1) {
    if (isFull && i === 3) {
      // Exclude the 1-pager PDF CSS styles if isFull=true
      break
    }

    css.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        `section-0${i}.css`
      )
    )
  }

  if (isFull) {
    // Use the multiptle pages PDF CSS styles if isFull=true
    // Remove puppeteer page.pageRanges to render multiple PDF pages
    css.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        'section-03-overflow.css'
      )
    )

    // Do not autoresize the recommendations text
    js = [
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        'fit-text-overflow.js'
      )
    ]
  }

  try {
    const [enso, seasonal] = await Promise.all([
      loadEnsoData(),
      seasonalForecastData(undefined, province)
    ])

    // Put ENSO data on the HTML string
    ensoImgDialBase64 = imageToBase64(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        'images',
        'enso',
        enso?.ensoImage ?? ''
      )
    )
    ensoImgMiscBase64 = imageToBase64(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'seasonal',
        'images',
        'enso',
        'colorful-logo.png'
      )
    )
    ensoData = enso?.ensoText ?? []

    // Load the formatted seasonal weather forecast data
    monthsHeaders = seasonal?.formattedMonths ?? []
    seasonalForecastTableData = seasonal?.tableData ?? []
    seasonalTableData = seasonal?.singleTableData ?? []
    weatherSystemsData = seasonal?.weatherSystemsList ?? []
    seasonalCoverage = `${monthsHeaders[0].formatted} to ${
      monthsHeaders[monthsHeaders.length - 1].formatted
    }`
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    // Render external loaded data on the HTML string
    html = ejs.render(html, {
      crop,
      province,
      ensoData,
      ensoImgMiscBase64,
      ensoImgDialBase64,
      hasProvincial,
      seasonalForecastTableData,
      seasonalTableData,
      weatherSystemsData,
      seasonalCoverage,
      monthsHeaders,
      mainTitle,
      recommendationsByStage,
      recommendationsImpacts,
      farmOperations,
      services,
      language
    })
  } catch (err) {
    throw new Error(err.message)
  }

  return {
    html,
    css,
    js
  }
}

module.exports = seasonalTemplatePDF
