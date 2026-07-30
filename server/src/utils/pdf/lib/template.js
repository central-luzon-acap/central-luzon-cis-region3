const fs = require('fs')
const {
  imageToBase64,
  imageBaseName
} = require('./image')

/**
 * Load an HTML file as string while replacing <img /> with base64 conversions.
 * @param {String} htmlFilePath - Full filename + path to an HTML file
 * @param {String[]} imageList - An array of image files with full paths used in the HTML file
 * @param {String} imageDirectory - Directory where images are stored, relative to the HTML file
 * @returns {String} HTML file as string with all image files replaced with base64 versions
 */
const htmlTemplate = (htmlFilePath, imageList, imageDirectory = 'images') => {
  let html = ''

  try {
    // Load the HTML file
    html = fs.readFileSync(htmlFilePath, 'utf-8')
  } catch (err) {
    throw new Error(err.message)
  }

  // Replace images in the HTML string with base64 format
  for (let i = 0; i < imageList.length; i += 1) {
    const imgbase64 = imageToBase64(imageList[i])
    const filename = imageBaseName(imageList[i])

    const prefix = /\.svg$/i.test(filename)
      ? 'data:image/svg+xml;base64,'
      : 'data:image/png;base64,'

    html = html.replace(`${imageDirectory}/${filename}`, `${prefix}${imgbase64}`)
  }

  return html
}

module.exports = htmlTemplate
