const {
  DETAIL_LABEL,
  META_KEYS
} = require('./constants')

const data = {
  /** Date of web scraping and DB update */
  date_updated: '',
  /** Has tropical cyclone data, Bool */
  has_cyclone: false,
  /** Summary description */
  summary: 'No Active Tropical Cyclone within the Philippine Area of Responsibility.',
  /** PAGASA original image URL, String */
  img: '',
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
    meta: {
      [META_KEYS.BULLETIN_NUMBER]: '-',
      [META_KEYS.ISSUED_AT]: '-',
      [META_KEYS.TYPHOON_NAME]: '-'
    },
    details: [
      { title: DETAIL_LABEL.EYE_CENTER, value: '-' },
      { title: DETAIL_LABEL.MOVEMENT, value: '-' },
      { title: DETAIL_LABEL.STRENGTH, value: '-' },
      { title: DETAIL_LABEL.FORECAST_POSITION, value: ['-', '-', '-'] }
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
