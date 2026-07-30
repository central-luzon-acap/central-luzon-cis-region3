import Box from '@mui/material/Box'
import Image from 'next/image'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WindPowerIcon from '@mui/icons-material/WindPower'
import { nameToIcon } from '../legends_data'
import styles from './styles'

function DailyWeather({ dailyweather }) {
  const nearestHundredths = (value) =>
    Math.round((value + Number.EPSILON) * 100) / 100
  const iconSize = 45

  const rainfallIcon =
    nameToIcon.rainfall[dailyweather.rainfall] !== undefined
      ? `images/icons/weather/${nameToIcon.rainfall[dailyweather.rainfall]}`
      : 'images/icons/weather/blank_weather.png'

  const cloudCoverIcon =
    nameToIcon.cloudCover[dailyweather.cover] !== undefined
      ? `images/icons/weather/${nameToIcon.cloudCover[dailyweather.cover]}`
      : 'images/icons/weather/blank_weather.png'

  return (
    <Box sx={styles.daily}>
      <Box sx={{ padding: 0 }}>
        <div className="temp-day">{dailyweather.day}</div>
        <div className="temp-weather-icons">
          <Image
            unoptimized
            src={assetPrefixer(rainfallIcon)}
            height={iconSize}
            width={iconSize}
            loader={imageLoader}
            alt={dailyweather.day}
          />
          <br />
          <Image
            unoptimized
            src={assetPrefixer(cloudCoverIcon)}
            height={iconSize}
            width={iconSize}
            loader={imageLoader}
            alt={dailyweather.day}
          />
        </div>
      </Box>
      <Box>
        <div className="temp-label">
          <div>
            <ThermostatIcon fontSize="12px" />
            <strong>{nearestHundredths(dailyweather.temp_avg)}&deg;</strong>
          </div>
          <div>
            <WindPowerIcon fontSize="12px" />
            {nearestHundredths(dailyweather.wspeed)}
          </div>
        </div>
      </Box>
    </Box>
  )
}

export default DailyWeather
