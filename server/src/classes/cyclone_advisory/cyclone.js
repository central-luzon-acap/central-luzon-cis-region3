const cheerio = require('cheerio')
const { admin, bucket, db } = require('../../utils/db')
const { AxiosInstance } = require('../../utils/axios')
const { downloadResizeUploadImage } = require('../../utils/pdf/lib/image')
const { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS } = require('../../utils/constants')
const { DETAIL_LABEL, META_KEYS } = require('./constants')
const dataTemplate = require('./data')

// This class scrapes and processes PAGASA's tropical cyclone (typhoon) weather data on the latest PAGASA website as of this writing:
// https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin
//
// Firestore: /w_services/cyclone_advisory
class TropicalCyclone {
  constructor () {
    this.pageUrl = dataTemplate.source
  }

  /**
   * Scrape special-advisory related cyclone data from PAGASA's website
   * @returns {Object} data - Object containing cyclone-related information
   * @returns {String} data.date_updated - Date the cyclone data was scraped
   * @returns {Bool} data.has_cyclone - Cyclone data is available
   * @returns {String} data.summary - Cyclone occurrence text description summary
   * @returns {String} data.img - Graphic cyclone image URL
   * @returns {String} data.source - PAGASA's Tropical Cyclone Bulletin website URL
   * @returns {String} data.type - internal typhoon advisory type
   * @returns {String} data.updated_by - Data scrapter/updated ("system" only)
   * @returns {String} data.email - Data updater's email
   * @returns {Object} data.data - Scraped tropical cyclone data
   * @returns {Object} data.data.meta - Cyclone information metadata
   *    - bulletin_number
   *    - issued_at
   *    - typhoon_name
   * @returns {Object[]} data.data.details - Cyclone overview details data
   * @returns {Object[]} data.data.signal - Cyclone signal data
   */
  async scrapecycloneinfo () {
    try {
      const { data } = await AxiosInstance({
        rejectUnauthorized: (process.env.AXIOS_SSL_REJECT_INVALID === '1')
      }).get(this.pageUrl)

      const $ = cheerio.load(data)

      // Find the "No Active Tropical Cyclone" text
      const noCycloneText = 'No Active Tropical Cyclone within the Philippine Area of Responsibility'
      const section = $(`div:contains("${noCycloneText}")`).next().text()
      dataTemplate.has_cyclone = !section || (section.length === 0)

      if (dataTemplate.has_cyclone) {
        // Default summary
        dataTemplate.summary = 'There is an active Tropical Cyclone within the Philippine Area of Responsibility.'

        // Step 1: Find the "Tropical Cyclone Bulletin Number" section
        dataTemplate.data.meta[META_KEYS.BULLETIN_NUMBER] = $('#swb').text().trim()

        // Step 2: Find the typhoon name. Its written in one of the <h3> tags.
        // The last word (typhoon name) is enclosed in double quotes
        $('h3').map(function () {
          const targetText = $(this).text().trim()
          const lastWordArray = targetText.match(/\b\W*(\w+)\W*$/g)

          if (lastWordArray !== null) {
            const lastWord = lastWordArray[0].trim()

            if (lastWord.includes('"')) {
              dataTemplate.data.meta[META_KEYS.TYPHOON_NAME] = targetText
            }
          }

          return true
        })

        // Step 3: Find the image map's source URL. Its an inside an
        // <img class="img-responsive img-preview"> tag
        const picture = $('img.image-preview').map(function () {
          return $(this)[0].attribs.src
        })

        if (picture.length > 0) {
          dataTemplate.img = picture[picture.length - 1]
        }

        // Step 4: Find the "Issued at" text content. Its written in one of the <h5> tags.
        $('h5').map(function () {
          const issuedAtText = $(this).text().trim()

          if (issuedAtText.includes('Issued at')) {
            dataTemplate.data.meta[META_KEYS.ISSUED_AT] = issuedAtText
          }

          return true
        })

        // Step 5: Find the main contents. They are written inside <div class="panel-body"> tags
        // and are preceeded by titles inside <div class="panel-heading"> tags
        // Both <div> tags are wrapped inside <div class="panel"> tags
        $('div.panel-heading').map(function () {
          const anchor = $(this)
          let itemTitle = anchor.text().trim()

          // Remove special miscellaneous characters
          if (itemTitle.includes(DETAIL_LABEL.WIND_SIGNAL)) {
            itemTitle = DETAIL_LABEL.WIND_SIGNAL
          }

          const index = dataTemplate.data.details
            .findIndex(item => item.title.toLowerCase() === itemTitle.toLowerCase())

          switch (itemTitle) {
            case DETAIL_LABEL.EYE_CENTER:
            case DETAIL_LABEL.MOVEMENT:
            case DETAIL_LABEL.STRENGTH:
              if (index > -1) {
                dataTemplate.data.details[index].value = $(anchor[0].parent).find('p').text().trim()
              }
              break
            case DETAIL_LABEL.FORECAST_POSITION: {
              const li = $(anchor[0].parent).find('li')

              if (li.length > 0) {
                dataTemplate.data.details[index].value = []
              }

              dataTemplate.data.details[index].value = li.map(function () {
                return $(this).text().trim()
              }).toArray()
            } break
            case DETAIL_LABEL.WIND_SIGNAL: {
              // Find each wind signal header title
              const signalTableHeaders = $(anchor[0].parent).find('thead')
              if (signalTableHeaders.length > 0) {
                dataTemplate.data.signal = []
              }

              signalTableHeaders.each(function (i, el) {
                const thead = $(el)
                const th = thead.find('th')

                if (th.length > 0) {
                  // The signal number is a picture (no text).
                  const signalNumPicture = th.find('img')

                  if (signalNumPicture.length > 0) {
                    const signalNumInPicture = signalNumPicture[0].attribs.src
                    const fileExtensionDotIndex = signalNumInPicture.lastIndexOf('.') // .png, .jpg

                    // Typhoon signals are 1 digit only, 1-4
                    const signalNum = signalNumInPicture.substring(fileExtensionDotIndex - 1, fileExtensionDotIndex)
                    const tempSignalObj = {
                      title: `SIGNAL NO. ${signalNum}`,
                      number: parseInt(signalNum ?? 0),
                      content: []
                    }

                    // Find each wind signal's 1st row content (per header title)
                    const signalTableBody = thead.next()
                    const td = signalTableBody.find('td').eq(1)
                    const islandGroupTitleContainer = td.find('strong')

                    islandGroupTitleContainer.each(function (i, el) {
                      const islandGroupTitle = $(el).text()
                      const provinces = $(el).next() // <ul>
                      const provincesText = provinces.text()

                      const temp = {
                        island: islandGroupTitle.trim(),
                        provinces: provincesText.replace(/[!@#$%^&*()_+=[\]{};:"\\|<>/?]/g, '').trim()
                      }

                      if (temp.provinces.length === 0) {
                        temp.provinces = '-'
                      }

                      tempSignalObj.content.push(temp)
                    })

                    dataTemplate.data.signal.push(tempSignalObj)
                  }
                }
              })
            } break
            default:
              break
          }
          return true
        })
      }

      return dataTemplate
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Set (overwrite) the cyclone advisory information
   * @param {Object} data
   */
  async setcycloneinformation (data) {
    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.SERVICES)
        .doc(FIRESTORE_DOCUMENTS.CYCLONE_ADVISORY)
        .set({
          ...data,
          type: FIRESTORE_DOCUMENTS.CYCLONE_ADVISORY,
          date_updated: admin.firestore.Timestamp.now()
        })
      return docRef
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getcycloneinformation () {
    return await db.collection(FIRESTORE_COLLECTIONS.SERVICES)
      .doc(FIRESTORE_DOCUMENTS.CYCLONE_ADVISORY)
      .get()
  }

  /**
   * Creates a low-resolution copy of PAGASA's original typhoon picture and uploads it to Firestore.
   * Uses a fallback image in case the downloading the original image fails.
   * @param {String} origImgUrl - Original image download URL
   * @returns {String} Firebase Storage download URL (signed URL) of the resized image file
   */
  async setlowresgraphic (origImgUrl) {
    const lowresFileName = 'cyclone-lowres.png'

    try {
      // Upload the generated lowres graphic to Firebase Storage
      const pdfRef = bucket.file(`${FIRESTORE_COLLECTIONS.ASSETS_IMAGES}/${lowresFileName}`)

      // Download and resize the graphic
      const url = await downloadResizeUploadImage(origImgUrl, 20, pdfRef)
      return url
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = TropicalCyclone
