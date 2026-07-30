const puppeteer = require('puppeteer')
const { bucket } = require('../../utils/db')

const { replaceWhitespaceWith } = require('../../utils/strings')
const { isDateValid } = require('../../utils/date')
const specialTemplatePDF = require('../../utils/pdf/pdf-special')
const { waitForDelay } = require('../../utils/helpers')
const { smsWriter, SMS_PLACEHOLDERS_V2 } = require('../../utils/sms-writer')
const sanityChecker = require('../../utils/sanitychecker')

const { createreport, getreport } = require('../../classes/report')
const { createbulletin } = require('../../classes/bulletin')
const { getcurrentdayforecast } = require('../../classes/tendayforecast')
const { getcycloneinformation } = require('../../classes/cyclone_advisory')
const { getspecialregionaldoc } = require('../../classes/regionalspecial')

const {
  usecropcalendartendayV2,
  getcropcalendardatasetV2
} = require('../../classes/calendar_v2')

const {
  getrecommendationsV2,
  getSmsRecommendationsV2,
  getfarmoperationsV2,
  grouprecommendationsV2,
  formatrecommendationsV2
} = require('../../classes/recommendations_v2')

const { grouprecommendationsimpacts } = require('../../classes/recommendations')

const {
  FIRESTORE_COLLECTIONS,
  FIRESTORE_DOCUMENTS,
  REPORT_TYPE,
  REGION
} = require('../../utils/constants')

/**
 * Validates report parameters and
 *    - Creates a Special forecast report based on the crop stage(s), current date, province and municipality request bodies.
 *      > Creating a report also creates a global Bulletin object and a global PDF bulletin, which is uploaded to Firestore
 *      > The global Bulletin object and PDF are expected to be overwritten with new values
 *    - Creates a PDF preview of the report
 *      > NOTE: The 10-day report is a superset of the special weather report. It considers the BOTH the
 *          month halves (1st_half AND 2nd_half) on which the 10-day date range starting from the "current" or "selected" day
 *          falls into when retrieving the crop stages
 */
module.exports.createSpecialReport = async (req, res, next) => {
  const { region, province, municipality, operation, date, crop, language = 'en' } = req.body
  const user = req.user

  let weatherData = {}
  let cycloneImageURL = ''
  let cycloneData = []
  let windspeedData = []
  let calendarData = []
  let recommendationsData = []
  let stageslist = []
  let uniquestages = []
  let cropslist = []
  let farmoperations = []
  let content = ''
  let impactsContent = ''

  let stagesData = null
  let cropsListData = null

  if (region === undefined || province === undefined || municipality === undefined || crop === undefined ||
      user === undefined || operation === undefined || date === undefined || language === undefined) {
    return res.status(500).send('Missing parameter/s.')
  }

  // Validate region
  if (region !== REGION) {
    return res.status(500).send(`Region ${region} is not supported.`)
  }

  // Validate province
  if (req.REGION_LOCATIONS[province] === undefined) {
    return res.status(500).send(`${province} is not a province under the ${region} region.`)
  }

  // Validate municipality
  if (!req.REGION_LOCATIONS[province].includes(municipality)) {
    return res.status(500).send(`${municipality} is not a municipality under the ${province} province.`)
  }

  // Validate process
  if (!['create', 'preview'].includes(operation)) {
    return res.status(500).send('Unsupported process.')
  }

  // Validate date
  if (!isDateValid(date)) {
    return res.status(500).send('Invalid date.')
  }

  try {
    // Get the current typhoon data
    const cyclone = await getcycloneinformation()

    if (cyclone.exists) {
      const typhoonData = cyclone.data()
      cycloneData = typhoonData?.data || []
      cycloneData.hasCyclone = typhoonData?.has_cyclone ?? false

      // Set the low-res cyclone image URL
      cycloneImageURL = typhoonData.img_lowres
    }
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Get the current typhoon data
    const windspeed = await getspecialregionaldoc({
      region: REGION,
      documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED
    })

    if (windspeed.exists) {
      windspeedData = windspeed.data()?.data || []
    }

    if (windspeedData.length === 0) {
      return res.status(500).send('No wind speed data.')
    } else {
      // Set the wind signal for the municipality
      windspeedData.municipalitySignal = windspeedData.find(item => item.province === province &&
        item.municipalities.includes(municipality))?.signal ?? 0
    }
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Get the municipality's current day weather data from the 10-Day weather forecast data
    weatherData = await getcurrentdayforecast({
      region,
      province,
      municipality
    })
  } catch (err) {
    return next(new Error(err))
  }

  if (!weatherData) {
    return next(new Error('Weather data for the requested municipality or date is not available at the moment.'))
  }

  try {
    // Validate crop while extracting the province-municipality cropping calendar data
    // Should have cropping calendar records for (1) or more crops for the given province and municipality
    [calendarData, stagesData, cropsListData] = await getcropcalendardatasetV2({
      province,
      municipality,
      crop,
      weatherTpye: 'tenday'
    })

    if (calendarData.length === 0) {
      return res.status(500).send(`Cannot find cropping calendar for ${province} - ${municipality}.`)
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
    return next(new Error(err))
  }

  try {
    // Extract unique valid crop stages details from the cropping calendar
    // Stages should be present in the cropping calendar given province, municipality (extracted) crop(s) and full (1st_half, 2nd_half) month(s)
    const {
      uniquecropstages,
      crops
    } = usecropcalendartendayV2({
      municipalcalendar: calendarData,
      dateStart: date,
      // Note Special weather forecast only considers the month half of the date an admin creates a bulletin
      isTendayRange: false,
      allStages: stagesData,
      cropslistData: cropsListData.filter(item => item === crop)
    })

    // Fetch crop recommendations (and all farmoperations) for the crop at its given crop stages from the crop calendar and forecast
    // Farm operations should be present in the crop recommendations given crop stages and forecast
    recommendationsData = await getrecommendationsV2({
      crop,
      stages: uniquecropstages.map(stage => stage.code),
      collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.SPECIAL
    })

    // Check recommendations and farm operations
    if (recommendationsData.length > 0) {
      farmoperations = getfarmoperationsV2(recommendationsData)
    }

    if (recommendationsData.length === 0) {
      return next(new Error('Cannot find crop recommendations.'))
    }

    if (farmoperations.length === 0) {
      return next(new Error('Cannot find crop farmoperations.'))
    }

    /**
     * 20240618: ACAP 2.0 allowed editing recommendations via the Firestore Web SDK,
     * making it also editable using the Firestore REST APIs:
     * https://firebase.google.com/docs/firestore/reference/rest/
     *
     * Validate HTML tags here, in case unwanted HTML tags gets past client-side validation
     */
    sanityChecker(recommendationsData, language)

    // Set the crops list
    cropslist = [...crops]

    // Set the crop stages list
    stageslist = uniquecropstages.map(stage => stage.label)
    uniquestages = [...uniquecropstages]
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Group the recommendations by crop stages - farm operations
    // The recommendations are already constructed to the read-only final HTML mark-up recommendations format
    recommendationsData.group = grouprecommendationsV2(recommendationsData, farmoperations, uniquestages)

    if (!recommendationsData.group) {
      return next(new Error('Error grouping recommendations by crop stages.'))
    } else {
      // Build the recommendations HTML string tags for report
      const language_full = {
        en: 'english',
        tag: 'tagalog'
      }

      content = formatrecommendationsV2({
        recommendationGroup: recommendationsData.group,
        recommendationType: `management_recommendations_${language_full[language]}`,
        cropStages: uniquestages
      })

      // Build the Impact Outlooks recommendations HTML string tags for report and PDF
      content += '<hr />'
      content += '<h2>Impact Outlooks</h2>'

      impactsContent = grouprecommendationsimpacts(recommendationsData, {
        en: 'management_recommendations_english',
        tag: 'management_recommendations_tagalog'
      })

      content += (language === 'en')
        ? impactsContent.impact
        : impactsContent.impact_tagalog
    }
  } catch (err) {
    return next(new Error(err))
  }

  // Create a PDF file for preview or uploading
  let file
  let browser
  let page
  let id
  let filename = `${province}_${municipality}_special`
  filename = replaceWhitespaceWith(filename, '_')

  try {
    // Create a PDF file
    // Initialize a new page with puppeteer
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    page = await browser.newPage()
    const addCss = []

    // Build the PDF HTML template string, replacing placedholers with dynamic-generated values
    // TO-DO: Load static HTML content here for the meantime
    const location = { region, province, municipality }
    const { html, css, js } = await specialTemplatePDF(
      location,
      language,
      recommendationsData?.group ?? null,
      cycloneData,
      windspeedData,
      cycloneImageURL,
      (language === 'en')
        ? impactsContent.impact
        : impactsContent.impact_tagalog
    )

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
      pageRanges: '1,1'
    })
  } catch (err) {
    return next(new Error(err.message))
  }

  if (operation === 'create') {
    if (cycloneData.length === 0 || cycloneData.hasCyclone === false) {
      return res.status(500).send('No tropical cyclone data.')
    }

    try {
      // Fetch the 10-day weather forecast SMS
      const smsTextContent = await getSmsRecommendationsV2({
        collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2.SPECIAL
      })

      // Save report
      const response = await createreport({
        user: req.user,
        region: REGION,
        province,
        municipality,
        crop: cropslist.toString().split(',').join(', '),
        month: Object.keys(weatherData.months).toString().split(',').join(', '),
        date_range: weatherData.date_range,
        stages: stageslist,
        activities: farmoperations,
        condition: weatherData.condition,
        rainfall: weatherData.rainfall,
        type: FIRESTORE_COLLECTIONS.SPECIAL_WEATHER,
        recommendations: content,
        smsRecommendations: smsWriter({
          text: smsTextContent,
          replacements: {
            [SMS_PLACEHOLDERS_V2.SPECIAL.FORECAST_RANGE]: cycloneData?.meta?.typhoon_name || '-'
          }
        })
      })
      id = response.id
    } catch (err) {
      return next(new Error(err))
    }

    // Upload the PDF file to Firebase Storage
    // Firebase Storage file destination
    const pdfRef = bucket.file(`${FIRESTORE_COLLECTIONS.PDF_STORAGE_SPECIAL}/${filename}.pdf`)

    try {
      // Upload PDF from stream to firebase storage
      console.log('[LOG]: Uploading 10-day bulletin to firebase storage')

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
          return next(new Error(err.message))
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
              crop: cropslist.toString().split(',').join(', '),
              filename: `${filename}.pdf`,
              reportId: id,
              user,
              type: REPORT_TYPE.SPECIAL
            })
          } catch (err) {
            console.log(`[ERROR]: 2 ${err.message}`)
            return next(new Error(`${err.message}. Report created. File uploaded. Error saving pdf log.`))
          }

          try {
            const report = await getreport(id)
            return res.status(200).send(report.data())
          } catch (err) {
            return next(new Error(err.message))
          }
        })
    } catch (err) {
      console.log(`[ERROR]: 3 ${err.message}`)
      return next(new Error(err))
    }
  } else if (operation === 'preview') {
    try {
      if (req?.headers?.origin !== process.env.LIVE_ORIGIN) {
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
          return next(new Error(err.message))
        })
    } catch (err) {
      await page.close()
      await browser.close()
      return next(new Error(err.message))
    }
  } else {
    return res.status(500).send('Unsupported process.')
  }
}
