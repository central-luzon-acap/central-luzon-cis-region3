import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DailyWeather from '../daily'
import CaptionText from '@/components/common/ui/captiontext'
import { imageLoader } from '@/utils/img-loader'
import { useDocument } from '@/hooks/usefirestore'
import { _Utilities } from '@/services/utilities/utilities'
import { getFirestoreDateTimeString } from '@/utils/date'
import styles from './styles'

const FORECAST_TYPES = {
  TEN_DAY: 'tenday',
  SEASONAL: 'seasonal',
  SPECIAL: 'special',
}

function WeatherToday({
  sel_options,
  weather,
  forecast,
  record,
  isSmallScreen = false,
}) {
  const [rightMargin, setRightMargin] = useState(0)
  const [selectedForecast, setSelectedForecast] = useState(
    FORECAST_TYPES.TEN_DAY,
  )
  const cardRef = useRef(null)
  const orderedKeys = ['Barangay', 'Municipality', 'Province', 'Association']

  // El Nino / La Nina monitoring doc — used as the compact Seasonal Forecast
  // preview (same source the full Seasonal Forecast page uses)
  const [enso, ensoLoading] = useDocument(
    _Utilities.GLOBAL_COLLECTIONS,
    _Utilities.TYPHOON_ADVISORY,
  )

  // Tropical cyclone doc — used as the compact Special Weather Forecast preview
  const [cyclone, cycloneLoading] = useDocument(
    _Utilities.GLOBAL_COLLECTIONS,
    _Utilities.CYCLONE_ADVISORY,
  )

  useEffect(() => {
    const getRightMargin = () =>
      (window.innerWidth - getViewportWidth()) / 2 + 24
    const resize = () => setRightMargin(getRightMargin())
    resize()

    // Set the right margin on window resize
    window.addEventListener('resize', resize)

    // Prevent state updates if the component was unmounted
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  const getViewportWidth = () => {
    // Main content area reference with. mui maxWidth = 1200
    const headerContents = document.getElementById('header-contents')

    if (!headerContents) {
      // Default MUI maxWidth for ACAP
      return 1200
    } else {
      const stats = headerContents.getBoundingClientRect()
      return stats.width
    }
  }

  const handleScroll = (direction) => {
    if (cardRef.current) {
      const scrollAmount = 100
      if (direction === 'up') {
        cardRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
      } else {
        cardRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: (theme) => theme.constants.navbar.outerHeight - 100,
        right: 18,
        marginLeft: '24px',
        zIndex: 400,
      }}
      className="mui-fixed"
    >
      {/** Municipality selector menu */}
      <Card
        variant="outlined"
        sx={styles.glanceCard}
      >
        <Box>
          <Typography variant="h5">Today&apos;s Weather</Typography>
        </Box>

        {sel_options.loading && (
          <Box
            sx={styles.info}
            style={{
              minWidth: isSmallScreen ? window.innerWidth - 80 : '285px',
            }}
          >
            <CircularProgress size={24} color="secondary" />
          </Box>
        )}

        {sel_options.error === '' &&
          !sel_options.loading &&
          sel_options.sel_municipality !== null &&
          weather.description !== '' && (
            <Box sx={styles.weathertoday}>
              <Typography
                variant="subtitle1"
                sx={{ width: '100%', fontWeight: 700, color: '#fff' }}
              >
                {sel_options.sel_municipality.label}, {sel_options.sel_province.label}
              </Typography>
              <div className="icon-temp">
                <Image
                  unoptimized
                  src={weather.icon}
                  height={70}
                  width={70}
                  loader={imageLoader}
                  alt={weather.description}
                />
                <div className="temperature">{weather.temp}&deg;C</div>
              </div>
              <div className="weather-details">
                <div>Date today: {weather.datenow}</div>
                <div>Humidity: {weather.humidity}</div>
                <div>Wind speed: {weather.wind}</div>
                <div>
                  {weather.description
                    ? `${weather.description
                        .charAt(0)
                        .toUpperCase()}${weather.description.slice(1)}`
                    : ''}
                </div>
              </div>
            </Box>
          )}

        {sel_options.error === '' &&
          !sel_options.loading &&
          sel_options.sel_municipality === null && (
            <Box
              sx={{
                ...styles.info,
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
              style={{
                minWidth: isSmallScreen ? window.innerWidth - 80 : '285px',
              }}
            >
              
            </Box>
          )}

        {sel_options.error !== '' && (
          <Box
            sx={styles.info}
            style={{
              minWidth: isSmallScreen ? window.innerWidth - 80 : '285px',
            }}
          >
            <p>{sel_options.error}</p>
          </Box>
        )}
      </Card>

      {/** Cropping Outlook: switches between 10-Day / Seasonal / Special previews */}
      {forecast.length > 0 && (
        <Box sx={{ position: 'relative' }}>
          <Card variant="outlined" sx={styles.card} ref={cardRef} style={{ marginTop: '10px', paddingBottom: '2px' }}>
            <Typography variant="h6">ACAP Services</Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1, mb: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: '240px' }}>
                <InputLabel id="forecast-navigation-label">Forecast page</InputLabel>
                <Select
                  labelId="forecast-navigation-label"
                  id="forecast-navigation"
                  value={selectedForecast}
                  label="Forecast page"
                  onChange={(event) => setSelectedForecast(event.target.value)}
                >
                  <MenuItem value={FORECAST_TYPES.TEN_DAY}>
                    10-Day Weather Forecast
                  </MenuItem>
                  <MenuItem value={FORECAST_TYPES.SEASONAL}>
                    Seasonal Forecast
                </MenuItem>
                <MenuItem value={FORECAST_TYPES.SPECIAL}>
                  Special Weather Forecast
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/** --- 10-Day Rainfall Forecast --- */}
          {selectedForecast === FORECAST_TYPES.TEN_DAY && (
            <>
              <Box sx={styles.outlookHeader}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>
                  10-Day Weather Forecast
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'rgba(0,0,0,0.55)' }}>
                  Date today: {weather.datenow}
                </Typography>
              </Box>

              <Grid container spacing={0.5} sx={{ width: '100%' }}>
                {forecast.map((item, index) => (
                  <Grid item xs={3} key={`daily-${index}`} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <DailyWeather dailyweather={item} />
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" style={{ fontSize: '10px' }} className="span-source">
                source:{' '}
                <a href="https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast">
                  PAGASA&apos;s 10-Day Climate Forecast
                </a>
              </Typography>
            </>
          )}

          {/** --- Seasonal Forecast (compact preview) --- */}
          {selectedForecast === FORECAST_TYPES.SEASONAL && (
            <Box sx={{ paddingBottom: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px', mb: 0.5 }}>
                El Ni&ntilde;o / La Ni&ntilde;a Monitoring
              </Typography>

              {ensoLoading && (
                <Box sx={styles.info}>
                  <CircularProgress size={20} color="secondary" />
                </Box>
              )}

              {!ensoLoading && enso === null && (
                <Typography variant="body2" sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
                  No seasonal forecast data is currently available.
                </Typography>
              )}

              {!ensoLoading && enso !== null && (
                <>
                  <Typography variant="body2" sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.75)' }}>
                    {enso.description}
                  </Typography>
                  <CaptionText sx={{ fontSize: '10px', display: 'block', mt: 1 }}>
                    Captured from PAGASA&apos;s El Ni&ntilde;o / La Ni&ntilde;a Monitoring page
                    {enso.updated_by && ` by ${enso.updated_by}`}
                    {enso.date_updated && ` on ${getFirestoreDateTimeString(enso.date_updated)}`}
                    .
                  </CaptionText>
                </>
              )}

              <CaptionText sx={{ fontSize: '11px', display: 'block', mt: 1 }}>
                View the full{' '}
                <Link href="/weather-services#seasonal-forecast">Seasonal Forecast</Link>{' '}
                for the rainfall outlook table and affecting weather systems.
              </CaptionText>
            </Box>
          )}

          {/** --- Special Weather Forecast (compact preview) --- */}
          {selectedForecast === FORECAST_TYPES.SPECIAL && (
            <Box sx={{ paddingBottom: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px', mb: 0.5 }}>
                Tropical Cyclone Summary
              </Typography>

              {cycloneLoading && (
                <Box sx={styles.info}>
                  <CircularProgress size={20} color="secondary" />
                </Box>
              )}

              {!cycloneLoading && cyclone === null && (
                <Typography variant="body2" sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
                  No special weather forecast data is currently available.
                </Typography>
              )}

              {!cycloneLoading && cyclone !== null && (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '12px',
                      color: cyclone.has_cyclone ? '#c62828' : 'rgba(0,0,0,0.75)',
                      fontWeight: cyclone.has_cyclone ? 700 : 400,
                    }}
                  >
                    {cyclone.summary}
                  </Typography>
                  <CaptionText sx={{ fontSize: '10px', display: 'block', mt: 1 }}>
                    Captured from PAGASA&apos;s Tropical Cyclone Bulletin
                    {cyclone.updated_by && ` (${cyclone.updated_by === 'system' ? 'system' : 'admin'} update)`}
                    {cyclone.date_updated && ` — ${getFirestoreDateTimeString(cyclone.date_updated)}`}
                    .
                  </CaptionText>
                </>
              )}

              <CaptionText sx={{ fontSize: '11px', display: 'block', mt: 1 }}>
                View the full{' '}
                <Link href="/weather-services#special-weather-forecast">Special Weather Forecast</Link>{' '}
                for wind signal details and cyclone tracking.
              </CaptionText>
            </Box>
          )}
          </Card>
        </Box>
      )}

      {/** Mobile (small screen) CurrentMapMarker */}
      {isSmallScreen && record !== null && (
        <Card variant="outlined" sx={styles.cardInfo}>
          <table>
            <tbody>
              {orderedKeys.map((info, idx) =>
                !['lat', 'lon'].includes(info) ? (
                  <tr key={idx}>
                    <td>
                      <b>{info}:</b>
                    </td>
                    <td>{record[info.toLowerCase()]}</td>
                  </tr>
                ) : (
                  <tr key={idx}></tr>
                ),
              )}
            </tbody>
          </table>
        </Card>
      )}
    </Box>
  )
}

export default WeatherToday
