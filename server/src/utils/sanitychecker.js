const sanitycheck = require('../scripts/seeders/13_recommendations/lib/sanitycheck')
const ExcelTabDefinition = require('../scripts/seeders/13_recommendations/classes/excelsheetdefv2')

/**
 * Checks if a list of crop recommendations objects contains only the allowed set HTML of tags.
 * Uses defined Firestore field names from ExcelTabDefinition.
 * @param {String} htmlString
 * @returns {Bool}
 */
const sanityChecker = (recommendations = [], language) => {
  const ENGLISH = 'en'
  const TAGALOG = 'tag'
  const LANGUAGES = [ENGLISH, TAGALOG]

  if (!recommendations) {
    throw new Error('No recommendations to check')
  }

  if (!Array.isArray(recommendations)) {
    throw new Error('Unsupported recommendations list format')
  }

  if (!language) {
    throw new Error('Missing language field')
  }

  if (!LANGUAGES.includes(language)) {
    throw new Error('Unsupported language')
  }

  try {
    // Use Firestore recommendations field definitions from uploader class
    const ExcelFields = new ExcelTabDefinition()

    const fields = language === ENGLISH
      ? [
        ExcelFields.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_ENGLISH,
        ExcelFields.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_ENGLISH
      ]
      : [
        ExcelFields.NORMAL_COLUMN_NAMES.IMPACT_OUTLOOK_TAGALOG,
        ExcelFields.NORMAL_COLUMN_NAMES.MANAGEMENT_RECOMMENDATIONS_TAGALOG
      ]

    if (fields.includes(null) || fields.includes(undefined)) {
      throw new Error('Undefined field/s in recommendations')
    }

    let errMsg = null

    for (let i = 0; i < recommendations.length; i += 1) {
      if (errMsg) break

      for (let j = 0; j < fields.length; j += 1) {
        if (!recommendations[i]?.[fields[j]]) {
          errMsg = `Missing "${fields[j]}" field in recommendation`
          break
        }

        if (!sanitycheck(recommendations[i]?.[fields[j]])) {
          errMsg = 'Recommendations contain unsupported HTML tags'
          break
        }
      }
    }

    if (errMsg) {
      throw new Error(errMsg)
    }

    return true
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = sanityChecker
