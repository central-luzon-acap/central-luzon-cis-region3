const puppeteer = require('puppeteer')
const { bucket } = require('../../utils/db')

const { createreport, getreport } = require('../../classes/report')
const { createbulletin } = require('../../classes/bulletin')
const { getcurrentdayforecast } = require('../../classes/tendayforecast')

const { smsWriter, SMS_PLACEHOLDERS_V2 } = require('../../utils/sms-writer')
const sanityChecker = require('../../utils/sanitychecker')

const {
  usecropcalendartendayV2,
  getcropcalendardatasetV2
} = require('../../classes/calendar_v2')

const {
  getrecommendationsV2,
  getSmsRecommendationsV2,
  getfarmoperationsV2,
  getcommoditiesV2,
  grouprecommendationsV2,
  formatrecommendationsV2
} = require('../../classes/recommendations_v2')

const { grouprecommendationsimpacts } = require('../../classes/recommendations')

const {
  FIRESTORE_COLLECTIONS,
  REPORT_TYPE,
  REGION
} = require('../../utils/constants')

const tendayTemplatePDF = require('../../utils/pdf/pdf-tenday')
const { waitForDelay } = require('../../utils/helpers')
const { replaceWhitespaceWith } = require('../../utils/strings')

/**
 * Validates report parameters and
 *    - Creates a report based from specified parameters.
 *      > Creating a report also creates a global Bulletin object and a global PDF bulletin, which is uploaded to Firestore
 *      > The global Bulletin object and PDF are expected to be overwritten with new values
 *    - Creates a PDF preview of the report
 *      > NOTE: The 10-day report is a superset of the special weather report. It considers the BOTH the
 *          month halves (1st_half AND 2nd_half) on which the 10-day date range starting from the "current" or "selected" day
 *          falls into when retrieving the crop stages
 */
module.exports.createTenDReport = async (req, res, next) => {
  const {
    region,
    province,
    municipality,
    operation,
    crop,
    services,
    language = 'en'
  } = req.body
  const user = req.user

  let weatherData = {}
  let calendarData = []
  let recommendationsData = []
  let commoditiesData = []
  let stageslist = []
  let stages = []
  let cropslist = []
  let farmoperations = []
  let content = ''
  let impactsContent = ''

  let climateRisk = ''
  let stagesData = null
  let cropsListData = null

  if (
    region === undefined ||
    province === undefined ||
    municipality === undefined ||
    user === undefined ||
    operation === undefined ||
    language === undefined ||
    crop === undefined
  ) {
    return res.status(500).send('Missing parameter/s.')
  }

  // Validate region
  if (region !== REGION) {
    return res.status(500).send(`Region ${region} is not supported.`)
  }

  // Validate province
  if (req.REGION_LOCATIONS[province] === undefined) {
    return res
      .status(500)
      .send(`${province} is not a province under the ${region} region.`)
  }

  // Validate municipality
  if (!req.REGION_LOCATIONS[province].includes(municipality)) {
    return res
      .status(500)
      .send(
        `${municipality} is not a municipality under the ${province} province.`
      )
  }

  // Validate process
  if (!['create', 'preview'].includes(operation)) {
    return res.status(500).send('Unsupported process.')
  }

  try {
    // Get the municipality's current day weather data from the 10-Day weather forecast data
    weatherData = await getcurrentdayforecast({
      region,
      province,
      municipality,
      dayNumber: 1
    })
  } catch (err) {
    return next(new Error(err))
  }

  if (!weatherData) {
    return next(
      new Error(
        'Weather data for the requested municipality and/or current date is not available at the moment.'
      )
    )
  }

  try {
    // Validate crop while extracting the full cropping calendar data
    // Should have cropping calendar records for (1) or more crops for the given province and municipality
    [calendarData, stagesData, cropsListData, climateRisk] =
      await getcropcalendardatasetV2({
        province,
        municipality,
        crop,
        weatherType: 'tenday',
        weatherData: weatherData?.days.map((item) => ({
          day: item.day,
          day_format: item.day_format,
          // day_str assumes using the latest set of 10-day weather forecast
          day_str: new Date(
            `${item.day_format} ${new Date().getFullYear()}`
          ).toLocaleDateString(),
          rainfall: item.rainfall
        }))
      })

    if (calendarData.length === 0) {
      return res
        .status(500)
        .send(
          `Cannot find cropping calendar for ${province} - ${municipality}.`
        )
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
    const { uniquecropstages, stagespercrop, crops } = usecropcalendartendayV2({
      municipalcalendar: calendarData,
      dateStart: weatherData?.days[0].date_start.toDate(),
      // Note: 10-day weather forecast considers 1st and/or 2nd month halves of the full active 10-day date range
      isTendayRange: true,
      allStages: stagesData,
      cropslistData: cropsListData.filter((item) => item === crop)
    })

    // Merge these climate risks for only for 10-day "bulletin/recommendations"
    const climateRiskRecoms = climateRisk

    // if (
    //   ['Flooding/Submergence 3M', 'Flooding/Submergence 2H'].includes(
    //     climateRisk
    //   )
    // ) {
    //   climateRiskRecoms = 'Flooding/Submergence'
    // }

    // Fetch crop recommendations (and all farmoperations) for the crop at its given crop stages from the crop calendar and forecast
    // Farm operations should be present in the crop recommendations given crop stages and forecast
    recommendationsData = await getrecommendationsV2({
      crop,
      climateRisk: climateRiskRecoms,
      stages: uniquecropstages.map((stage) => stage.code),
      collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.TENDAY
    })

    // Check recommendations and farm operations
    if (recommendationsData.length > 0) {
      farmoperations = getfarmoperationsV2(recommendationsData)
    }

    if (recommendationsData.length === 0) {
      return next(new Error(`Cannot find crop recommendations for ${crop}`))
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

    // Build data for the commodities section
    commoditiesData = getcommoditiesV2(recommendationsData, stagespercrop)

    // Set the crops list
    cropslist = [...crops]

    // Set the crop stages list
    stageslist = uniquecropstages.map((stage) => stage.label)
    stages = [...uniquecropstages]
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Group the recommendations by crop stages - farm operations
    // The recommendations are already constructed to the read-only final HTML mark-up recommendations format
    recommendationsData.group = grouprecommendationsV2(
      recommendationsData,
      farmoperations,
      stages
    )

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
        cropStages: stages
      })

      // Build the Impact Outlooks recommendations HTML string tags for report and PDF
      content += '<hr />'
      content += '<h2>Impact Outlooks</h2>'

      impactsContent = grouprecommendationsimpacts(recommendationsData, {
        en: 'impact_outlook_english',
        tag: 'impact_outlook_tagalog'
      })

      content +=
        language === 'en'
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
  let filename = `${province}_${municipality}_10_day`
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
    const { html, css, js } = await tendayTemplatePDF(
      crop,
      location,
      language,
      commoditiesData,
      recommendationsData?.group ?? null,
      language === 'en' ? impactsContent.impact : impactsContent.impact_tagalog,
      services
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

    page.setDefaultTimeout(180000) // Set to 60 seconds, adjust as needed

    file = await page.createPDFStream({
      format: 'A4',
      printBackground: true,
      pageRanges: '1,1'
    })
  } catch (err) {
    return next(new Error(err.message))
  }

  if (operation === 'create') {
    try {
      // Fetch the 10-day weather forecast SMS text
      const tendayWeatherSMS = await getSmsRecommendationsV2({
        collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2.TENDAY,
        climateRiskKey: 'climate_risk',
        climateRisk,
        crop
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
        risk: climateRisk,
        type: FIRESTORE_COLLECTIONS.TEN_DAY,
        recommendations: content,
        services,
        smsRecommendations: smsWriter({
          text: tendayWeatherSMS,
          replacements: {
            [SMS_PLACEHOLDERS_V2.TENDAY.FORECAST_RANGE]: weatherData.date_range
          }
        })
      })
      id = response.id
    } catch (err) {
      return next(new Error(err))
    }

    // Upload the PDF file to Firebase Storage
    // Firebase Storage file destination
    const pdfRef = bucket.file(
      `${FIRESTORE_COLLECTIONS.PDF_STORAGE_TENDAY}/${filename}.pdf`
    )

    try {
      // Upload PDF from stream to firebase storage
      console.log('[LOG]: Uploading 10-day bulletin to firebase storage')

      file
        .pipe(
          pdfRef.createWriteStream({
            gzip: true,
            resumable: false,
            validation: false,
            metadata: {
              contentType: 'application/pdf',
              metadata: {
                createdAt: Date.now()
              }
            }
          })
        )
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
              type: REPORT_TYPE.TEN_DAY
            })
          } catch (err) {
            console.log(`[ERROR]: 2 ${err.message}`)
            return next(
              new Error(
                `${err.message}. Report created. File uploaded. Error saving pdf log.`
              )
            )
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
      res.setHeader(
        'Content-Disposition',
        `'attachment; filename="${filename}"'`
      )
      res.setHeader('Access-Control-Allow-Origin', process.env.LIVE_ORIGIN)

      file
        .pipe(res)
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
