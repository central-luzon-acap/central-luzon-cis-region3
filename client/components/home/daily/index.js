import Box from '@mui/material/Box'
import Image from 'next/image'
import { imageLoader } from '@/utils/img-loader'
import styles from './styles'

import ThermostatIcon from '@mui/icons-material/Thermostat'
import WindPowerIcon from '@mui/icons-material/WindPower'

function DailyWeather ({ dailyweather }) {
  return (
    <Box sx={styles.daily}>
      <div className='daily-date'>{dailyweather.day}</div>
      <div>
        <Image
          unoptimized
          src={dailyweather.icon}
          height={25}
          width={25}
          loader={imageLoader}
          alt={dailyweather.day} />
      </div>
      <div className='temp-label'>
        <div>
          <ThermostatIcon fontSize='12px' />
          <strong>{dailyweather.temp_mean}&deg;</strong>
        </div>
        <div>
          <WindPowerIcon fontSize='12px' />
          {dailyweather.wind_speed}
        </div>
      </div>
    </Box>
  )
}

export default DailyWeather
