const puppeteer = require('puppeteer')
const { bucket } = require('../../utils/db')

const { replaceWhitespaceWith } = require('../../utils/strings')
const specialSignalTemplatePDF = require('../../utils/pdf/pdf-special-signal')
const { waitForDelay } = require('../../utils/helpers')
const { smsWriter, SMS_PLACEHOLDERS_V2 } = require('../../utils/sms-writer')
const sanityChecker = require('../../utils/sanitychecker')

const { createreport, getreport } = require('../../classes/report')
const { createbulletin } = require('../../classes/bulletin')
const { getcropcalcropslistV2 } = require('../../classes/calendar_v2')
const { getcycloneinformation } = require('../../classes/cyclone_advisory')
const { getspecialregionaldoc } = require('../../classes/regionalspecial')

const {
  getrecommendationsV2,
  getSmsRecommendationsV2
} = require('../../classes/recommendations_v2')

const {
  FIRESTORE_COLLECTIONS,
  FIRESTORE_DOCUMENTS,
  REPORT_TYPE,
  REGION,
  WIND_SIGNAL_CODES,
  WIND_SIGNAL
} = require('../../utils/constants')

/**
 * Validates report parameters and
 *    - This is a variant of the original `createSpecialReport()` function.
 *    - Creates a Special forecast report based on the `wind signal`, province and municipality request bodies, minus the crop stage(s) and current date.
 *      > Creating a report also creates a global Bulletin object and a global PDF bulletin, which is uploaded to Firestore
 *      > The global Bulletin object and PDF are expected to be overwritten with new values
 *    - Creates a PDF preview of the report
 *      > NOTE: The 10-day report is a superset of the special weather report. It considers the BOTH the
 *          month halves (1st_half AND 2nd_half) on which the 10-day date range starting from the "current" or "selected" day
 *          falls into when retrieving the crop stages
 */
module.exports.createSpecialSignalReport = async (req, res, next) => {
  const { region, province, municipality, crop, operation, signal, language = 'en' } = req.body
  const user = req.user

  let cycloneImageURL = ''
  let cycloneData = []
  let windspeedData = []
  let recommendationsData = []
  let smsRecommendations = ''
  let content = ''

  if (region === undefined || crop === undefined ||
    signal === undefined || operation === undefined
  ) {
    return res.status(500).send('Missing parameter/s.')
  }

  // Validate region
  if (region !== REGION) {
    return res.status(500).send(`Region ${region} is not supported.`)
  }

  // Validate process
  if (!['create', 'preview'].includes(operation)) {
    return res.status(500).send('Unsupported process.')
  }

  // Pre-validate signal
  if (!WIND_SIGNAL[signal]) {
    return res.status(500).send('Wind signal not supported.')
  }

  // Validate province/municipality if there's a PAGASA wind signal
  if (signal !== WIND_SIGNAL_CODES.SIGNAL_0) {
    // Validate province
    if (req.REGION_LOCATIONS[province] === undefined) {
      return res.status(500).send(`${province} is not a province under the ${region} region.`)
    }

    // Validate municipality
    if (!req.REGION_LOCATIONS[province].includes(municipality)) {
      return res.status(500).send(`${municipality} is not a municipality under the ${province} province.`)
    }
  }

  try {
    const [crops, cyclone, windspeed] = await Promise.all([
      // Fetch the crops list
      getcropcalcropslistV2(),
      // Fetch the current PAGASA cyclone data
      getcycloneinformation(),
      // Fetch the latest admin-encoded provice-municipality wind signal
      getspecialregionaldoc({
        region: REGION,
        documentName: FIRESTORE_DOCUMENTS.SEASONAL_SPECIAL_WEATHER.WIND_SPEED
      })
    ])

    // Set the crops list
    if (!crops.includes(crop)) {
      return res.status(500).send('Crop not supported')
    }

    if (cyclone.exists) {
      const typhoonData = cyclone.data()
      cycloneData = typhoonData?.data || []
      cycloneData.hasCyclone = typhoonData?.has_cyclone ?? false

      // Set the low-res cyclone image URL
      cycloneImageURL = typhoonData.img_lowres
    }

    if (windspeed.exists) {
      windspeedData = windspeed.data()?.data || []
    }

    // Validate user-supplied signal with PAGASA signal
    if (signal !== WIND_SIGNAL_CODES.SIGNAL_0) {
      if (windspeedData.length === 0) {
        return res.status(500).send('No wind province/municipality wind speed data for', WIND_SIGNAL[signal])
      } else {
        // Set the wind signal for the municipality
        const signalData = windspeedData.find(item => item.province === province &&
          item.municipalities.includes(municipality))

        windspeedData.municipalitySignalLabel = signalData?.signal ?? 0
        windspeedData.signalNumber = signalData?.value ?? 0

        // Validate the user-provided province municipality's signal with PAGASA cyclone signal
        const signals = cycloneData.signal.map(item => item.number)

        if (!signals.includes(windspeedData.signalNumber)) {
          throw new Error('Wind signal not in the active typhoon wind signals list')
        }
      }
    }
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Fetch recommendations
    [recommendationsData, smsRecommendations] = await Promise.all([
      getrecommendationsV2({
        collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_V2.SPECIAL,
        windSignal: signal,
        crop
      }),
      getSmsRecommendationsV2({
        collection: FIRESTORE_COLLECTIONS.CROP_RECOMMENDATIONS_SMS_V2.SPECIAL,
        windSignal: signal,
        crop
      })
    ])

    // v2 special recommendations expect only one (1) recommendation (row) per wind signal
    if ((recommendationsData ?? []).length !== 1) {
      throw new Error('Unexpected number of recommendations')
    }

    const smsNotAvailable = 'SMS text is not available'
    if (!smsRecommendations || smsRecommendations === smsNotAvailable) {
      throw new Error(smsNotAvailable)
    }

    /**
     * 20240618: ACAP 2.0 allowed editing recommendations via the Firestore Web SDK,
     * making it also editable using the Firestore REST APIs:
     * https://firebase.google.com/docs/firestore/reference/rest/
     *
     * Validate HTML tags here, in case unwanted HTML tags gets past client-side validation
     */
    sanityChecker(recommendationsData, language)

    // Build the Management Practices recommendations HTML string tags for report
    content = (language === 'en')
      ? recommendationsData[0]?.management_recommendations_english
      : recommendationsData[0]?.management_recommendations_tagalog

    // Build the Impact Outlooks recommendations HTML string tags for report
    content += '<hr />'
    content += '<h2>Impact Outlooks</h2>'

    content += (language === 'en')
      ? recommendationsData[0]?.impact_outlook_english
      : recommendationsData[0]?.impact_outlook_tagalog
  } catch (err) {
    return next(new Error(err))
  }

  // Create a PDF file for preview or uploading
  let file
  let browser
  let page
  let id
  const dateNow = (new Date().toLocaleDateString()).split('/').reverse().join('')
  let filename = (signal !== WIND_SIGNAL_CODES.SIGNAL_0)
    ? `special_${province}_${municipality}_${crop}`
    : `special_general_${crop}_${dateNow}`

  filename = replaceWhitespaceWith(filename, '_')

  try {
    // Create a PDF file
    // Initialize a new page with puppeteer
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    page = await browser.newPage()
    const addCss = []

    // Build the PDF HTML template string, replacing placedholers with dynamic-generated values
    const location = { region, province, municipality }
    const { html, css, js } = await specialSignalTemplatePDF(
      location,
      language,
      cycloneData,
      windspeedData,
      cycloneImageURL,
      (language === 'en')
        ? recommendationsData[0]?.impact_outlook_english
        : recommendationsData[0]?.impact_outlook_tagalog,
      (language === 'en')
        ? recommendationsData[0]?.management_recommendations_english
        : recommendationsData[0]?.management_recommendations_tagalog
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
    if (signal !== WIND_SIGNAL_CODES.SIGNAL_0 &&
      (cycloneData.length === 0 || cycloneData.hasCyclone === false)
    ) {
      return res.status(500).send('No tropical cyclone data.')
    }

    try {
      // Save report
      const response = await createreport({
        user: req.user,
        region: REGION,
        province: province ?? 'n/a',
        municipality: municipality ?? 'n/a',
        crop,
        month: 'n/a',
        date_range: 'n/a',
        stages: 'n/a',
        activities: 'n/a',
        condition: 'n/a',
        rainfall: 'n/a',
        wind_signal: WIND_SIGNAL?.[signal] ?? 'n/a',
        typhoon: cycloneData?.meta?.typhoon_name ?? 'n/a',
        type: FIRESTORE_COLLECTIONS.SPECIAL_WEATHER,
        recommendations: content,
        smsRecommendations: smsWriter({
          text: smsRecommendations,
          replacements: {
            [SMS_PLACEHOLDERS_V2.SPECIAL.FORECAST_RANGE]: cycloneData?.meta?.typhoon_name || '-',
            [SMS_PLACEHOLDERS_V2.SPECIAL.SPECIAL_LOCATION]: `${province}, ${municipality}` || '-'
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
      const typeName = (signal === WIND_SIGNAL_CODES.SIGNAL_0)
        ? 'General '
        : ''

      console.log(`[LOG]: Uploading ${typeName}Special bulletin to firebase storage`)

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
              region: REGION,
              province: province ?? 'n/a',
              municipality: municipality ?? 'n/a',
              crop,
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
            // TO-DO: Get general recoms report
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
