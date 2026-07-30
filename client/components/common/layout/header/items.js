const menuItems = {
  /*
  home: {
    href: '/',
    name: 'Home'
  },
  */
  weather: {
    href: '/weather-services',
    name: 'ACAP Services',
    subitems: [
      {
        href: '/weather-services',
        query: 'ten-day-weather-forecast',
        name: '10-Day Weather Forecast',
      },
      {
        href: '/weather-services',
        query: 'seasonal-forecast',
        name: 'Seasonal Forecast',
      },
      {
        href: '/weather-services',
        query: 'special-weather-forecast',
        name: 'Special Weather Forecast',
      },
      {
        href: '/weather-services',
        query: 'support-services',
        name: 'Support Services',
      },
    ],
  },
  calendar: {
    href: '/cropping-calendar-v2',
    name: 'Cropping Calendar',
    subitems: [],
  },
  agroclimatic: {
    href: '/agroclimatic-services',
    name: 'Recommendations',
    subitems: [
      {
        href: '/agroclimatic-services',
        query: 'seasonal-recommendations',
        name: 'Regional Seasonal Climate Outlook and Advisory',
      },
      {
        href: '/agroclimatic-services',
        query: 'resilient-practices',
        name: '10-Day Farm Weather Outlook and Advisory',
      },
    ],
  },
  bulletins: {
    href: '/bulletins',
    name: 'Bulletins',
    subitems: [],
  },
  news: {
    href: '/weather-news',
    name: 'Weather News',
    subitems: [],
  },
}

export default menuItems
