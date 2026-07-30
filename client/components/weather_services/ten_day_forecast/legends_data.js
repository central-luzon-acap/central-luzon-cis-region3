const rainfallIcons = [
  {
    icon: 'cc_sunny_49.svg',
    label: 'No rain',
    nowrap: true,
  },
  {
    icon: 'rainfall_light_rain_49.svg',
    label: 'Light rain',
  },
  {
    icon: 'rainfall_moderate_rain_49.svg',
    label: 'Moderate rain',
  },
  {
    icon: 'rainfall_heavy_rain_49.svg',
    label: 'Heavy rain',
  },
  {
    icon: 'blank_weather.png',
    label: 'Heavy rain',
    hidden: true,
  },
]

const cloudCoverIcons = [
  {
    icon: 'cc_sunny_49.svg',
    label: 'Sunny',
  },
  {
    icon: 'cc_mostly_sunny_49.svg',
    label: 'Mostly sunny',
  },
  {
    icon: 'cc_partly_cloudy_49.svg',
    label: 'Partly cloudy',
  },
  {
    icon: 'cc_mostly_cloudy_49.svg',
    label: 'Mostly cloudy',
  },
  {
    icon: 'cc_cloudy_49.svg',
    label: 'Cloudy',
  },
]

const nameToIcon = {
  rainfall: {
    'NO RAIN': 'cc_sunny_49.svg',
    'LIGHT RAINS': 'rainfall_light_rain_49.svg',
    'MODERATE RAINS': 'rainfall_moderate_rain_49.svg',
    'HEAVY RAINS': 'rainfall_heavy_rain_49.svg',
  },
  cloudCover: {
    SUNNY: 'cc_sunny_49.svg',
    'MOSTLY SUNNY': 'cc_mostly_sunny_49.svg',
    'PARTLY CLOUDY': 'cc_partly_cloudy_49.svg',
    'MOSTLY CLOUDY': 'cc_mostly_cloudy_49.svg',
    CLOUDY: 'cc_cloudy_49.svg',
  },
}

export { rainfallIcons, cloudCoverIcons, nameToIcon }
