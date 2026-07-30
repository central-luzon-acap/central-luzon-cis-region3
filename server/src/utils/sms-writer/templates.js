require('dotenv').config()

const SMS_TYPE = {
  SEASONAL: 'seasonal',
  TENDAY: 'tenday',
  SPECIAL: 'special'
}

const REPLACE_KEYS = {
  SEASONAL: { MONTH: 'month' },
  TENDAY: {
    FORECAST: '10_day_forecast',
    MUNICIPALITY: 'municipality'
  },
  SPECIAL: {
    TYPHOON_NAME: 'typhoon_name',
    TYPHOON_SIGNAL: 'signal_no',
    MUNICIPALITY: 'municipality'
  }
}

// These are placeholder text between double curly brackets "{{}}" matching with the
// SMS text placeholders from the v2 crop recommendations Excel files
const SMS_PLACEHOLDERS_V2 = {
  SEASONAL: {
    FORECAST_RANGE: 'seasonal_range_identifier'
  },
  TENDAY: {
    FORECAST_RANGE: '10_day_range_identifier'
  },
  SPECIAL: {
    FORECAST_RANGE: 'special_weather_name_identifier',
    SPECIAL_LOCATION: 'municipality_identifier'
  }
}

const SMS_SEASONAL = `Magandang araw mga ka-AMIA! Available na ang ating Regional Seasonal Climate Outlook and Advisory para sa buwan ng {{month}}. Bisitahin ang ${process.env.LIVE_ORIGIN}/bulletins/seasonal-outlook/ o makipag-ugnayan sa DA RFO 3 para sa iba pang impormasyon.`

const SMS_TENDAY = `
Magandang araw, mga Ka-AMIA! Narito ang ulat panahon para sa darating na sampung araw para sa munisipyo ng {{municipality}}:\n
{{10_day_forecast}}
Para sa buong ulat panahon, bisitahin ang ${process.env.LIVE_ORIGIN}/weather-services/#ten-day-weather-forecast o makipag-ugnayan sa DA RFO 3.
`

const SMS_SPECIAL = 'Mag-ingat sa mga pinsalang maaring idulot ng bagyong {{typhoon_name}}. Ang Signal No.{{signal_no}} ay kasalukuyang nakataas sa munisipyo/siyudad ng {{municipality}}. Maging handa at alerto, mga Ka-AMIA!'

module.exports = {
  SMS_SEASONAL,
  SMS_TENDAY,
  SMS_SPECIAL,
  SMS_TYPE,
  REPLACE_KEYS,
  SMS_PLACEHOLDERS_V2
}
