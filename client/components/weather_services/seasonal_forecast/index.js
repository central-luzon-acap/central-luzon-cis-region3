import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import RainfallViewer from '../../admin/weather/seasonalpanel/viewer'
import ClimatePattern from './climate_pattern'
import WeatherSystems from './weather_systems'
import styles from './styles'

function SeasonalForecast (props) {
  const { seasonal, typhoon } = props
  const { fsLoading, loading } = props

  const getDuration = () => {
    let strLabel = ''

    if (seasonal.length > 0) {
      const first = seasonal[0].mos[0]
      const last = seasonal[0].mos[seasonal[0].mos.length - 1]
      strLabel = `${first.charAt(0).toUpperCase()}${first.slice(1)} to ${last.charAt(0).toUpperCase()}${last.slice(1)}`
    }

    return strLabel
  }

  return (
    <Box sx={styles.wrapper} id='contents-seasonal-forecast'>
      <Typography variant='h4'>Seasonal Forecast</Typography>

      {/** El Nino/La Nina content */}
      <ClimatePattern typhoon={typhoon} loading={loading} />

      {/** Weather Systems That May Affect the Region table */}
      <Typography variant='subtitle2'>Weather Systems that May Affect the Region</Typography>
      <WeatherSystems />

      {(!fsLoading && seasonal.length > 0) &&
      <Typography id='bacap-seasonal-forecast' variant='subtitle2'>Analysis of RAINFALL from&nbsp;
        {getDuration()}
      </Typography>
      }

      {/** Seasonal Rainfall forecast table */}
      <RainfallViewer
        weatherData={seasonal}
        withBorder
        fsLoading={fsLoading}
      />
    </Box>
  )
}

export default SeasonalForecast
