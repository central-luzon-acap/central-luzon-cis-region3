const sites = [
  {
    path: '/',
    name: 'Home',
    info: 'BACAP\'s Home page.',
    selectors: ['#bacap-intro']
  },
  {
    path: 'weather-services',
    name: 'ACAP Services',
    info: 'Seasonal and 10-Day Weather Forecasts, and Special Weather Advisory',
    selectors: ['#contents-seasonal-forecast', '#contents-tenday-forecast', '#contents-special-weather-forecast']
  },
  {
    path: 'cropping-calendar',
    name: 'Cropping Calendar',
    info: 'Cropping calendar page',
    selectors: ['#bacap-cropping-calendar']
  },
  {
    path: 'agroclimatic-services',
    name: 'Regional Seasonal Climate Outlook and Advisory',
    info: 'Seasonal crop recommendations and 10-Day Farm Weather Outlook and Advisory',
    selectors: ['#contents-seasonal-recommendations', '#contents-tenday-recommendations']
  },
  {
    path: 'bulletins',
    name: 'Bulletins',
    info: 'Bulletins PDF Downloads page.',
    selectors: ['#acap-bulletins']
  },
  {
    path: 'bulletins/weather',
    name: '10-Day Farm Weather Outlook Bulletins',
    info: '10-Day Farm Weather Outlook Bulletins PDF downloads page.',
    selectors: ['#acap-bulletins-10day']
  },
  {
    path: 'bulletins/seasonal-outlook',
    name: 'Regional Seasonal Climate Outlook and Advisory Bulletins',
    info: 'Regional Seasonal Climate Outlook and Advisory PDF downloads page.',
    selectors: ['#acap-bulletins-seasonal']
  },
  {
    path: 'bulletins/special-weather-forecast',
    name: 'Special Weather Forecast Bulletins',
    info: 'Special Weather Forecast PDF downloads page.',
    selectors: ['#acap-bulletins-special']
  },
  {
    path: 'admin',
    name: 'Admin',
    info: 'Website management',
    selectors: ['#bacap-login']
  }
]

module.exports = sites
