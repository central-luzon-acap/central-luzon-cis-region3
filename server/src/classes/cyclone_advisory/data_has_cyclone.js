const {
  DETAIL_LABEL,
  META_KEYS
} = require('./constants')

const data = {
  /** Date of web scraping and DB update */
  date_updated: '',
  /** Has tropical cyclone data, Bool */
  has_cyclone: true,
  /** Summary description */
  summary: 'There is an active Tropical Cyclone within the Philippine Area of Responsibility.',
  /** PAGASA original image URL, String */
  img: 'https://firebasestorage.googleapis.com/v0/b/amia-cis-dev.appspot.com/o/undefined%2Fimg_lowres.png?alt=media&token=5dcabc64-2130-4e3b-9d8d-4520c59ab799',
  /** Low-resolution version of image URL, String */
  img_lowres: '',
  /** PAGASA website URL, String */
  source: 'https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin',
  /** ACAP advisory type */
  type: 'cyclone_advisory',
  /** Data updater */
  updated_by: 'system',
  /** Data updater email */
  email: '-',
  /** Scraped data */
  data: {
    img: 'https://firebasestorage.googleapis.com/v0/b/amia-cis-dev.appspot.com/o/undefined%2Fimg_lowres.png?alt=media&token=5dcabc64-2130-4e3b-9d8d-4520c59ab799',
    meta: {
      [META_KEYS.BULLETIN_NUMBER]: 'TROPICAL CYCLONE BULLETIN #23',
      [META_KEYS.ISSUED_AT]: 'Issued at 5:00 AM, 25 September 2022',
      [META_KEYS.TYPHOON_NAME]: 'TYPHOON "KARDING" NORU'
    },
    details: [
      { title: DETAIL_LABEL.EYE_CENTER, value: 'The center of the eye was estimated based on all availablbe data 190 km West of Dagupan City, Pangasinan (16.2°N, 118°E)' },
      { title: DETAIL_LABEL.MOVEMENT, value: 'The center of the eye was estimated based on all availablbe data 190 km West of Dagupan City, Pangasinan (16.2°N, 118°E)' },
      { title: DETAIL_LABEL.STRENGTH, value: 'Maximum sustained winds of 140 km/h near the center and gustiness up to 170 km/h' },
      {
        title: DETAIL_LABEL.FORECAST_POSITION,
        value: [
          'Sept 26 5:00 PM - 390 km West of Dagupan City, Pangasinan',
          'Sept 27 5:00 AM - 690 km West of Dagupan City, Pangasinan (OUTSIDE PAR)',
          'Sept 27 5:00 PM - 930 km West of Dagupan City, Pangasinan (OUTSIDE PAR)'
        ]
      }
    ],
    signal: [
      {
        title: 'SIGNAL NO. 1',
        content: [] // [{ island: String, provinces: String },... ]
      }
    ]
  }
}

module.exports = data
