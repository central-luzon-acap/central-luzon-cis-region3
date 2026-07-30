require('dotenv').config()
const puppeteer = require('puppeteer')
const { bucket } = require('../../../utils/db')
const { createreport, getreport } = require('..')
const { createbulletin } = require('../../bulletin')
const { getforecast } = require('../../seasonalforecast')

const {
  usecropcalendarseasonalV2,
  getcropcalendardatasetV2,
  usecropcalendarseasonalFull
} = require('../../calendar_v2')

const {
  getrecommendationsV2,
  getSmsRecommendationsV2,
  getfarmoperationsV2,
  grouprecommendationsV2,
  formatrecommendationsV2
} = require('../../recommendations_v2')

const { grouprecommendationsimpacts } = require('../../recommendations')

const seasonalTemplatePDF = require('../../../utils/pdf/pdf-seasonal')
const { waitForDelay } = require('../../../utils/helpers')
const { replaceWhitespaceWith } = require('../../../utils/strings')
const { smsWriter, SMS_PLACEHOLDERS_V2 } = require('../../../utils/sms-writer')
const sanityChecker = require('../../../utils/sanitychecker')

const {
  FIRESTORE_COLLECTIONS,
  REPORT_TYPE,
  REGION,
  WEATHER_CONDITION_LABELS,
  NO_DATA_AVAILABLE
} = require('../../../utils/constants')

/**
 * Validates report parameters and
 *    - Creates a report based from specified parameters.
 *      > Creating a report also creates a global Bulletin object and a global PDF bulletin, which is uploaded to Firestore
 *      > The global Bulletin object and PDF are expected to be overwritten with new values
 *    - Creates a PDF preview of the report
 * @typedef {Object} params - Input parameters
 * @param {String} params.region - Region name
 * @param {String} params.province - Province name
 * @param {String} params.municipality - Municipality name
 * @param {String} params.month - Month code included in the current (6) seasonal months i.e., jan, feb, mar,... dec
 * @param {String} params.crop - Crop name
 *  - if provided, this script will create a seasonal PDF report for the full (6) seasonal months instead of just one (1) `params.month`
 * @param {String} params.operation - Process type (create, preview)
 * @param {String} params.language - Crop recommendations language (en, tag)
 * @param {Bool} params.isFull - Flag to use cropping calendar data for the full six (6) seasonal months. Defaults to "false".
 * @param {Object} params.user - User information
 * @param {Object} params.res - (Optional) Express response object. Required if this script is run in an Express server
 * @param {String} params.origin - Domain namme originating the HTTP request
 * @returns {Object} Seasonal recommendations report data
 */
const createSeasonalReport = async ({
  REGION_LOCATIONS, region, province, municipality, month, crop,
  operation = 'create', language = 'en', isFull = false,
  user, res, origin
}) => {
  let validmo = false

  let stages = []
  let activities = []
  let recommendations = []
  let cropping_calendar = null
  let condition = ''
  let conditions = null
  let fdata = {}
  let content = ''
  let impactsContent = null
  const year = new Date().getFullYear()

  let climateRisk = ''
  let stagesData = null
  let cropsListData = null

  // Recommendations grouped by crop stages
  recommendations.group = null

  if (region === undefined || province === undefined || municipality === undefined ||
      crop === undefined || user === undefined || operation === undefined || language === undefined) {
    console.log(region, province, municipality, month, crop, operation = 'create', language = 'en', user)
    throw new Error('Missing parameter/s.')
  }

  if (!isFull && !month) {
    throw new Error('Missing month parameter.')
  }

  // Validate region
  if (region !== REGION) {
    return res.status(500).send(`Region ${region} is not supported.`)
  }

  // Validate province
  if (REGION_LOCATIONS[province] === undefined) {
    return res.status(500).send(`${province} is not a province under the ${region} region.`)
  }

  // Validate municipality
  if (!REGION_LOCATIONS[province].includes(municipality)) {
    return res.status(500).send(`${municipality} is not a municipality under the ${province} province.`)
  }

  // Validate process
  if (!['create', 'preview'].includes(operation)) {
    throw new Error('Unsupported process.')
  }

  // Validate language
  if (!['en', 'tag'].includes(language)) {
    throw new Error('Unsupported language.', language)
  }

  // Validate month
  // Should exist in the current (6) seasonal months
  try {
    const forecast = await getforecast({ region: REGION, province })

    if (forecast.exists) {
      fdata = forecast.data()

      if (!isFull) {
        // Validate month and condition if one month parameter is provided
        validmo = fdata.mos.includes(month)

        if (!validmo) {
          throw new Error(`${month} is not included in the seasonal weather forecast months.`)
        } else {
          const forecast_code = fdata.months.find(x => x.mo === month).con
          condition = Object.values(WEATHER_CONDITION_LABELS).find(rec => rec.label === forecast_code)?.label ?? null

          if (condition === null) {
            throw new Error('Invalid weather forecast.')
          }

          if (condition === NO_DATA_AVAILABLE) {
            const eMessage = `(${province}, ${municipality}) No rainfall condition data available for the selected month of "${month}"`
            throw new Error(eMessage)
          }
        }
      } else {
        // Build the 6 seasonal months forecast condition summary
        conditions = fdata.months.map((item, id) => ({
          id,
          mo: item.mo,
          con: item.con
        }))
      }
    } else {
      throw new Error('There was an error reading the seasonal forecast.')
    }
  } catch (err) {
    throw new Error(err)
  }

  try {
    // Validate crop while extracting the full cropping calendar data
    // Should have a cropping calendar record for the given province, municipality and crop
    [cropping_calendar, stagesData, cropsListData, climateRisk] = await getcropcalendardatasetV2({
      province,
      municipality,
      crop,
      weatherType: 'seasonal',
      weatherData: fdata?.months?.map((item) => ({
        condition: item.con,
        mo: item.mo,
        year: item.year
      }))
    })

    if (!cropping_calendar) {
      throw new Error(`Cannot find cropping calendar for ${crop}.`)
    }

    if (!stagesData) {
      return res.status(500).send(`Invalid crop stages data for ${crop}`)
    }

    if (cropsListData.length === 0) {
      return res.status(500).send('Missing crops list')
    }

    if (cropsListData.indexOf(crop) === -1) {
      return res.status(500).send('Crop not supported')
    }
  } catch (err) {
    throw new Error(err)
  }

  try {
    // Extract unique valid crop stages details from the cropping calendar
    // Stages should be present in the cropping calendar given province, municipality, crop and full (1st_half, 2nd_half) month
    let stagesCalendarData = { uniquecropstages: [] }

    if (isFull) {
      // Fetch cropping calendar data from the active six (6) seasonal months
      stagesCalendarData = usecropcalendarseasonalFull({
        municipalcalendar: cropping_calendar,
        monthcodes: fdata.months.map(item => item.mo),
        allStages: stagesData
      })
    } else {
      // Fetch cropping calendar data from a given month
      stagesCalendarData = usecropcalendarseasonalV2({
        municipalcalendar: cropping_calendar,
        monthcode: month,
        allStages: stagesData
      })
    }

    stages = [...stagesCalendarData.uniquecropstages]

    if (stages.length === 0) {
      throw new Error('The crop has no available stages.')
    }
  } catch (err) {
    throw new Error(err)
  }

  try {
    // Fetch crop recommendations (and all activities) for the crop at its given crop stages from the crop calendar and forecast
    // Activities should be present in the crop recommendations given crop stages and forecast
    recommendations = await getrecommendationsV2({
      crop,
      climateRisk,
      stages: stages.map(stage => stage.code),
      collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.SEASONAL
    })

    if (recommendations.length > 0) {
      activities = getfarmoperationsV2(recommendations)
    }

    if (recommendations.length === 0) {
      throw new Error(`Cannot find crop recommendations for ${crop}`)
    }

    if (activities.length === 0) {
      throw new Error('Cannot find crop activities.')
    }

    /**
     * 20240618: ACAP 2.0 allowed editing recommendations via the Firestore Web SDK,
     * making it also editable using the Firestore REST APIs:
     * https://firebase.google.com/docs/firestore/reference/rest/
     *
     * Validate HTML tags here, in case unwanted HTML tags gets past client-side validation
     */
    sanityChecker(recommendations, language)
  } catch (err) {
    throw new Error(err)
  }

  try {
    // Group the recommendations by crop stages - farm operations
    // The recommendations are already constructed to the read-only final HTML mark-up recommendations format
    recommendations.group = grouprecommendationsV2(recommendations, activities, stages)

    if (!recommendations.group) {
      throw new Error('Error grouping recommendations by crop stages.')
    } else {
      // Build the recommendations HTML string tags for report
      const language_full = {
        en: 'english',
        tag: 'tagalog'
      }

      content = formatrecommendationsV2({
        recommendationGroup: recommendations.group,
        recommendationType: `management_recommendations_${language_full[language]}`,
        cropStages: stages
      })

      // Build the Impact Outlooks recommendations HTML string tags for report and PDF
      content += '<hr />'
      content += '<h2>Impact Outlooks</h2>'

      impactsContent = grouprecommendationsimpacts(recommendations, {
        en: 'impact_outlook_english',
        tag: 'impact_outlook_tagalog'
      })

      content += (language === 'en')
        ? impactsContent.impact
        : impactsContent.impact_tagalog
    }
  } catch (err) {
    throw new Error(err.message)
  }

  const recsTitle = `${province}, ${municipality} - ${crop}`
  const monthFileName = isFull
    ? `${fdata.mos[0]}_${fdata.mos[fdata.mos.length - 1]}`
    : month

  // Create a PDF file for preview or uploading
  let file
  let browser
  let page
  let id
  let filename = `${province}_${municipality}_${crop}_${monthFileName}_${year}`
  filename = replaceWhitespaceWith(filename, '_')

  try {
    // Create a PDF file
    // Initialize a new page with puppeteer
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    page = await browser.newPage()
    const addCss = []

    // Build the PDF HTML template string, replacing placedholers with dynamic-generated values
    const { html, css, js } = await seasonalTemplatePDF({
      recommendationsByStage: recommendations?.group ?? null,
      recommendationsImpacts: (language === 'en') ? impactsContent.impact : impactsContent.impact_tagalog,
      mainTitle: recsTitle,
      farmOperations: activities,
      language,
      isFull
    })

    // Load the HTML file on the new page
    await page.setContent(html, { waitUntil: 'domcontentloaded' })

    // Wait for a small delay to simulate body.onload
    await waitForDelay(1)

    // Load CSS on the new page
    css.forEach((item) => {
      addCss.push(page.addStyleTag({ path: item }))
    })

    // Load and run JS on the new page
    js.forEach((item) => {
      addCss.push(page.addScriptTag({ path: item }))
    })

    await Promise.all(addCss)

    // Wait for a small delay to finish to ensure all css and js are loaded
    // on the page before starting to render the PDF
    await waitForDelay(1)

    file = await page.createPDFStream({
      format: 'A4',
      printBackground: true,
      // 20240601: Overflow PDF to the next pages if isFull=true
      // (all 6 seasonal months = very long recommendations)
      ...(!isFull && { pageRanges: '1,1' })
    })
  } catch (err) {
    throw new Error(err.message)
  }

  if (operation === 'create') {
    try {
      // Fetch the 10-day weather forecast SMS text
      const seasonalWeatherSMS = await getSmsRecommendationsV2({
        collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2.SEASONAL,
        climateRiskKey: 'climate_risk',
        climateRisk,
        crop
      })

      const capitalizeFirstLetter = (text) => text.charAt(0).toUpperCase() + text.slice(1)
      const monthsRange = `${capitalizeFirstLetter(fdata.mos[0])} - ${capitalizeFirstLetter(fdata.mos[fdata.mos.length - 1])}`

      // Save report
      const response = await createreport({
        user,
        region: REGION,
        province,
        municipality,
        crop,
        month: (!isFull) ? month : monthsRange,
        condition: (!isFull) ? condition : 'n/a',
        ...((isFull && conditions) && { conditions }),
        stages: stages.map(stage => stage.label),
        activities,
        risk: climateRisk,
        type: REPORT_TYPE.SEASONAL,
        recommendations: content,
        smsRecommendations: smsWriter({
          text: seasonalWeatherSMS,
          replacements: {
            [SMS_PLACEHOLDERS_V2.SEASONAL.FORECAST_RANGE]: isFull
              ? monthsRange
              : capitalizeFirstLetter(fdata.mos[0])
          }
        })
      })
      id = response.id
    } catch (err) {
      await browser.close()
      throw new Error(err)
    }

    return new Promise((resolve, reject) => {
      // Upload the PDF file to Firebase Storage
      // Firebase Storage file destination
      const pdfRef = bucket.file(`${FIRESTORE_COLLECTIONS.PDF_STORAGE_SEASONAL}/${filename}.pdf`)

      try {
        // Upload PDF from stream to firebase storage
        console.log('[LOG]: Uploading to firebase storage')

        file.pipe(pdfRef.createWriteStream({
          gzip: true,
          resumable: false,
          validation: false,
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              createdAt: Date.now()
            }
          }
        }))
          .on('error', async (err) => {
            await page.close()
            await browser.close()
            console.log(`[ERROR]: 1 ${err.message}`)
            return reject(new Error(err.message))
          })
          .on('finish', async () => {
            await page.close()
            await browser.close()

            try {
              // Create a Bulletin (PDF) log entry
              await createbulletin({
                region,
                province,
                municipality,
                crop,
                filename: `${filename}.pdf`,
                reportId: id,
                user,
                type: REPORT_TYPE.SEASONAL
              })
            } catch (err) {
              console.log(`[ERROR]: 2 ${err.message}`)
              return reject(new Error(`${err.message}. Report created. File uploaded. Error saving pdf log.`))
            }

            if (res) {
              try {
                const report = await getreport(id)
                return resolve(report.data())
              } catch (err) {
                return reject(new Error(err.message))
              }
            } else {
              return resolve(true)
            }
          })
      } catch (err) {
        console.log(`[ERROR]: 3 ${err.message}`)
        return reject(err)
      }
    })
  } else if (operation === 'preview') {
    if (res) {
      try {
        if (origin !== process.env.LIVE_ORIGIN) {
          await page.close()
          await browser.close()
          return res.status(403).send('Unauthorized origin for PDF preview')
        }

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `'attachment; filename="${filename}"'`)
        res.setHeader('Access-Control-Allow-Origin', process.env.LIVE_ORIGIN)

        file.pipe(res)
          .on('finish', async () => {
            await page.close()
            await browser.close()
          })
          .on('error', async (err) => {
            await page.close()
            await browser.close()
            return res.status(500).send(err.message)
          })
      } catch (err) {
        await page.close()
        await browser.close()
        return res.status(500).send(err.message)
      }
    }
  } else {
    await page.close()
    await browser.close()
    throw new Error('Unsupported process.')
  }
}

module.exports = createSeasonalReport
