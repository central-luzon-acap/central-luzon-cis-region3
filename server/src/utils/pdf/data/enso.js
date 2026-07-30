const path = require('path')
const { gettyphooninformation } = require('../../../classes/typhoonadvisory')

const ensoTypes = {
  elnino: 'El Niño',
  'elnino-alert': 'El Niño Alert',
  'elnino-watch': 'El Niño Watch',
  inactive: 'Inactive',
  lanina: 'La Niña',
  'lanina-alert': 'La Niña Alert',
  'lanina-watch': 'La Niña Watch'
}

/**
 * Load, process, format and extract relevant data from the weekly-scraped ENSO data on
 * https://www.pagasa.dost.gov.ph/climate/el-nino-la-nina/monitoring
 * @returns {String[]} ensoText - Array of ENSO text
 * @returns {String} ensoImage - ENSO graphic file name
 * @returns {String} ensoAlert - ENSO alert level
 */
const loadEnsoData = async () => {
  let ensoImage = 'lanina.png' // Default placeholder
  let ensoAlert = '-'
  let ensoText = []

  try {
    const result = await gettyphooninformation()

    if (result.exists) {
      let { description, img } = result.data()

      // Remove strings of "***..."
      description = description.replace(/\*/g, '')

      // Set the low-resolution enso graphic file
      const imageFilename = path.basename(img)
      const entype = imageFilename.replace(/.png/g, '').toLowerCase()
      ensoImage = (Object.keys(ensoTypes).includes(entype))
        ? `${entype}-lowres.png`
        : 'lanina-lowres.png'

      // Set the enso alert type
      ensoAlert = ensoTypes[entype] || 'La Niña Watch'
      ensoText.push(`ENSO Alert System Status: ${ensoAlert} Advisory`)

      // Set the enso text descriptions
      const sentences = description
        .replace(/(\r\n|\n|\r|\n\n)/gm, '')
        .split('.')
        .map(x => x.trim())
        .filter(x => x !== '')

      if (sentences.length > 2) {
        sentences.forEach((sentence, index) => {
          if (index === 1) {
            ensoText[1] += ` ${sentence}`
          } else {
            ensoText.push(sentence)
          }
        })
      } else {
        ensoText = [...sentences]
      }
    }
  } catch (err) {
    throw new Error(err.message)
  }

  return {
    ensoText,
    ensoImage,
    ensoAlert
  }
}

module.exports = loadEnsoData
