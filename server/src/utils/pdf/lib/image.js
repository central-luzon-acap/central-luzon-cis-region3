const fs = require('fs')
const path = require('path')
const axios = require('axios')
const dayjs = require('dayjs')
const sharp = require('sharp')

/**
 * Convert an image file to base64
 * @param {String} filename - Image file with full directory path
 * @returns {String} Base64 string
 */
const imageToBase64 = (filename) => {
  try {
    const img = fs.readFileSync(filename).toString('base64')
    return img
  } catch (err) {
    throw new Error(err.message)
  }
}

/**
 * Downloads an image file from a remote download URL
 * @param {String} imageUrl - Image download URL
 * @param {String} filePath - Full image and directory path to store the downloaded image
 * @param {Bool} doReturnFile - true|false flage to return the raw image file
 * @returns {String}
 *    - doReturnFile=true: - Return the raw image file
 *    - doReturnFile=false - Return the imageUrl after finishing download
 */
const downloadImage = async (imageUrl, filePath, doReturnFile = false) => {
  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream'
  })

  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filePath))
      .on('error', reject)
      .once('close', () => {
        if (doReturnFile) {
          resolve(imageToBase64(filePath))
        } else {
          resolve(filePath)
        }
      })
  })
}

/**
 * Downloads an image to buffer and saves its resized version to local storage.
 * @param {String} imageUrl - Original image file's download URL
 * @param {String} filePath - Full local file path with image name where to save the resized image
 * @param {Number} quality - Resize image quality (1-100)
 * @param {String} output - Output type
 *    - file = writes the resized image file to filePath
 *    - buffer = returns an array buffer
 *    - base64 = returns a base64 string
 * @returns {String} Local file path of the resized image
 * @throws {Error} Image download, resize and other errors
 */
const downloadResizeImage = async (imageUrl, filePath, quality = 20, output = 'file') => {
  try {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    const imgBuffer = Buffer.from(response.data, 'binary')

    if (output === 'file') {
      await sharp(imgBuffer)
        .png({ quality })
        .toFile(filePath)
      return filePath
    } else if (output === 'buffer') {
      return await sharp(imgBuffer)
        .png({ quality })
        .toBuffer()
    } else if (output === 'base64') {
      const sharpImg = await sharp(imgBuffer)
        .png({ quality })
        .toBuffer()

      return sharpImg.toString('base64')
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

/**
 * Downloads and resizes image from a download URL to buffer and uploads its resized version to Firebase Storage.
 * Uses a fallback image in case the downloading the original image fails.
 * @param {String} imageUrl - Original image file's download URL
 * @param {Number} quality - Resize image quality (1-100)
 * @param {Object} imageStorage - Firebase Storage bucket file
 * @param {String} imgFallbackPath - Full file path to a local image file that will serve as fallback
 * @returns {String} Firebase Storage download URL (signed URL) of the resized image file
 * @throws {Error} Image download, resize, upload and other errors
 */
const downloadResizeUploadImage = async (
  imageUrl,
  quality = 20,
  imageStorage,
  imgFallbackPath = path.join(__dirname, '..', 'livereload', 'public', 'special', 'images', 'track_maymay_lowres.png')
) => {
  let imgBuffer

  try {
    // Download the original image file to buffer
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    imgBuffer = Buffer.from(response.data, 'binary')
  } catch (err) {
    console.log(`[ERROR]: Error downloading file, using fallback: ${err.message}`)

    try {
      // Use the local fallback image
      const img = imageToBase64(imgFallbackPath)
      imgBuffer = Buffer.from(img, 'base64')
    } catch (err) {
      throw new Error(err.message)
    }
  }

  if (!imgBuffer) {
    throw new Error('Malformed image buffer')
  }

  try {
    // Resize and upload the image
    await sharp(imgBuffer)
      .png({ quality })
      .toBuffer()
      .then(async (data) => {
        /* eslint-disable new-cap */
        await imageStorage.save((new Buffer.from(data, 'base64')), {
          contentType: 'image/png'
        })
          .catch(err => {
            throw new Error(err)
          })
      })
      .catch(err => {
        throw new Error(err)
      })
  } catch (err) {
    throw new Error(err.message)
  }

  try {
    // Get Firebase Storage URL download link
    const expires = dayjs().add(6, 'day').format()
    const signedURLconfig = { action: 'read', expires }
    const signedURLArray = await imageStorage.getSignedUrl(signedURLconfig)
    return signedURLArray[0]
  } catch (err) {
    throw new Error(err.message)
  }
}

/**
 * Get the base name of a file
 * @param {String} filename - File name with or without full directory path
 */
const imageBaseName = (filename) => {
  return path.basename(filename)
}

module.exports = {
  imageToBase64,
  imageBaseName,
  downloadImage,
  downloadResizeImage,
  downloadResizeUploadImage
}
