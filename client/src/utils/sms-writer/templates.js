const SMS_TYPE = {
  SEASONAL: 'seasonal',
  TENDAY: 'tenday',
  SPECIAL: 'special'
}

const REPLACE_KEYS = {
  SEASONAL: { MONTH: 'month' },
  TENDAY: {
    MUNICIPALITY: 'municipality',
    FORECAST: '10_day_forecast'
  },
  SPECIAL: {
    TYPHOON_NAME: 'typhoon_name',
    TYPHOON_SIGNAL: 'signal_no',
    MUNICIPALITY: 'municipality'
  }
}

const MONTHS_TAGALOG = {
  jan: 'Enero',
  feb: 'Pebrero',
  mar: 'Marso',
  apr: 'Abril',
  may: 'Mayo',
  jun: 'Hunyo',
  jul: 'Hulyo',
  aug: 'Agosto',
  sep: 'Setyembre',
  oct: 'Octobre',
  nov: 'Nobyembre',
  dec: 'Disyembre'
}

const SMS_SEASONAL = `Magandang araw mga ka-AMIA! Available na ang ating Regional Seasonal Climate Outlook and Advisory para sa buwan ng {{month}}. Bisitahin ang ${process.env.BASE_URL}/bulletins/seasonal-outlook/ o makipag-ugnayan sa DA 3 para sa iba pang impormasyon.`

const SMS_TENDAY = `
Magandang araw, mga Ka-AMIA! Narito ang ulat panahon para sa darating na sampung araw para sa munisipyo ng {{municipality}}:\n
{{10_day_forecast}}
Para sa buong ulat panahon, bisitahin ang ${process.env.BASE_URL}/weather-services/#ten-day-weather-forecast o makipag-ugnayan sa DA RFO 3.
`
const SMS_SPECIAL = 'Mag-ingat sa mga pinsalang maaring idulot ng bagyong {{typhoon_name}}. Ang Signal No.{{signal_no}} ay kasalukuyang nakataas sa munisipyo/siyudad ng {{municipality}}. Maging handa at alerto, mga Ka-AMIA!'

module.exports = {
  SMS_SEASONAL,
  SMS_TENDAY,
  SMS_SPECIAL,
  SMS_TYPE,
  REPLACE_KEYS,
  MONTHS_TAGALOG
}
