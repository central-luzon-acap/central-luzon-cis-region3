const path = require('path')
const ejs = require('ejs')
const template = require('./lib/template')
const { downloadResizeImage, imageToBase64 } = require('./lib/image')

const specialBulletinImages = [
  'amia-logo.png'
  // 'track_maymay_lowres.png'
]

/**
 * HTML, CSS and Image files definition for the 10-Day Bulletin PDF template
 * @param {Object} location - Location information { region, province, municipality }
 * @param {String} language - Recommendations language option "en" or "tag"
 * @param {Object[]} recommendationsByStage - Recommendations with crop stages as keys. Each crop stage group contains farm operations as keys,
 *    and each farm operation contains a series of <ol>, <ul>, <li>, <p> formatted HTML tags recommendations
 * @param {Object[]} cycloneData - Special typhoon/cyclone weather data scraped from PAGASA
 * @param {Object[]} windspeedData - Admin-encoded wind speed data containing cyclone-affected municipalities
 * @param {String} imgUrl - URL of the low-resolution typhoon graphic image converted from PAGASA's original image
 * @param {Object} recommendationsImpacts - Impact Outlook recommendations as formatted HTML tags
 * @returns {String} html - HTML string containing remote relevant data and all image references converted to base64
 * @returns {String[]} css - List of full-path CSS files used in the HTML file
 * @returns {String[]} js - List of full-path JS files used in the HTML file
 */
const specialTemplatePDF = async (location, language, recommendationsByStage, cycloneData, windspeedData, imgUrl, recommendationsImpacts = null) => {
  let html = ''
  let cycloneImage

  // TO-DO: Download and use the latest typhoon map graphic
  try {
    cycloneImage = await downloadResizeImage(imgUrl, '', 20, 'base64')
  } catch (err) {
    const fallbackImage = path.join(__dirname, 'livereload', 'public', 'special', 'images', 'track_maymay_lowres.png')
    cycloneImage = imageToBase64(fallbackImage)
    console.log(`[WARNING]: ${err.message}. Using fallback image file.`)
  }

  // Full-path list of images used in the HTML file
  const images = [path.resolve(__dirname, 'livereload', 'public', 'common', 'images', 'da-logo.png')]

  // Other images file paths
  for (let i = 0; i < specialBulletinImages.length; i += 1) {
    images.push(path.resolve(__dirname, 'livereload', 'public', 'special', 'images', specialBulletinImages[i]))
  }

  // Load the HTML file
  html = template(path.resolve(__dirname, 'templates', 'pdf-special.ejs'), images, '../livereload/public/special/images')

  // Replace the cyclone image with the latest typhoon picture
  if (cycloneImage) {
    const prefix = 'data:image/png;base64,'
    html = html.replace('../livereload/public/special/images/track_maymay_lowres.png', `${prefix}${cycloneImage}`)
  }

  // Keep track of CSS file paths
  const css = []
  const miscCss = ['times-new-roman.css', 'normalize.css']
  miscCss.forEach((cssFile) => {
    css.push(path.resolve(__dirname, 'livereload', 'public', 'common', cssFile))
  })

  // Keep track of JS script paths
  const js = [path.resolve(__dirname, 'livereload', 'public', 'special', 'main.js')]

  for (let i = 0; i <= 3; i += 1) {
    css.push(path.resolve(__dirname, 'livereload', 'public', 'special', `section-0${i}.css`))
  }

  // TO-DO: Load external data
  // TO-DO: Render external loaded data on the HTML string
  try {
    // Render external loaded data on the HTML string
    html = ejs.render(html, {
      recommendationsByStage,
      recommendationsImpacts,
      cycloneData,
      windspeedData: windspeedData.map(item => ({
        ...item,
        municipalities: item.municipalities.toString().split(',').join(', ')
      })),
      location,
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

module.exports = specialTemplatePDF
