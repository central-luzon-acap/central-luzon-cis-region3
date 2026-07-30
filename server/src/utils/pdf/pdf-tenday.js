const path = require('path')
const ejs = require('ejs')
const template = require('./lib/template')
const { getTendayWeatherForecast } = require('./data/tenday')

const moonPhasesImages = [
  'first-quarter.png',
  'full-moon.png',
  'new-moon.png',
  'last-quarter.png'
]

const cloudCoverImages = [
  'cloudy.png',
  'cloudy_2.png',
  'mostly-cloudy.png',
  'mostly-cloudy_2.png',
  'mostly-sunny.png',
  'mostly-sunny_2.png',
  'partly-cloudy.png',
  'partly-cloudy_2.png',
  'sunny.svg',
  'sunny_2.svg',
  'sunny_3.svg'
]

const rainfallIntensityImages = [
  'light-rain.svg',
  'light-rain_2.svg',
  'moderate-rain.svg',
  'moderate-rain_2.svg',
  'heavy-rain.svg',
  'heavy-rain_2.svg',
  'sunny.svg'
]

/**
 * HTML, CSS and Image files definition for the 10-Day Bulletin PDF template
 * @param {Object} location - Location information { region, province, municipality }
 * @param {String} language - Recommendations language option "en" or "tag"
 * @param {Object[]} commoditiesData - Commodities section data [{ crop, stages[], activities },... ]
 * @param {Object[]} recommendationsByStage - Recommendations with crop stages as keys. Each crop stage group contains farm operations as keys,
 *    and each farm operation contains a series of <ol>, <ul>, <li>, <p> formatted HTML tags recommendations
 * @param {Object} recommendationsImpacts - Impact Outlook recommendations as formatted HTML tags
 * @returns {String} html - HTML string containing remote relevant data and all image references converted to base64
 * @returns {String[]} css - List of full-path CSS files used in the HTML file
 * @returns {String[]} js - List of full-path JS files used in the HTML file
 */
const tendayTemplatePDF = async (
  crop,
  location,
  language,
  commoditiesData,
  recommendationsByStage,
  recommendationsImpacts = null,
  services
) => {
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
    )
  ]

  // Other images file paths
  for (let i = 0; i < moonPhasesImages.length; i += 1) {
    images.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'common',
        'images',
        moonPhasesImages[i]
      )
    )
  }

  // Other images file paths
  for (let i = 0; i < cloudCoverImages.length; i += 1) {
    images.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'common',
        'images',
        cloudCoverImages[i]
      )
    )
  }

  // cloudCoverImages.forEach((cloudCoverImage) => {
  //   images.push(path.resolve(__dirname, 'livereload', 'public', 'common', 'images', cloudCoverImage))
  // })

  rainfallIntensityImages.forEach((rainfallIntensityImage) => {
    images.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'common',
        'images',
        rainfallIntensityImage
      )
    )
  })

  // Load the HTML file
  html = template(
    path.resolve(__dirname, 'templates', 'pdf-tenday.ejs'),
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
  const js = [
    path.resolve(__dirname, 'livereload', 'public', 'tenday', 'main.js')
  ]

  for (let i = 0; i <= 4; i += 1) {
    css.push(
      path.resolve(
        __dirname,
        'livereload',
        'public',
        'tenday',
        `section-0${i}.css`
      )
    )
  }

  // TO-DO: Load external data
  // TO-DO: Render external loaded data on the HTML string
  try {
    const { weatherforecast: weatherTableData, moonPhasesData } =
      await getTendayWeatherForecast({
        region: location.region,
        province: location.province,
        municipality: location.municipality
      })

    // Render external loaded data on the HTML string
    html = ejs.render(html, {
      crop,
      weatherTableData,
      moonPhasesData,
      commoditiesData,
      recommendationsByStage,
      recommendationsImpacts,
      location,
      language,
      services
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

module.exports = tendayTemplatePDF
