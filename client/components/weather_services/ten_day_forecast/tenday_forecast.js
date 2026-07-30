import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ADAPTER_STATES } from '@/store/constants'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DailyWeather from './daily'
import EmptyState from '@/common/ui/empty_state'
import CaptionText from '@/common/ui/captiontext'
import TendayLegends from '@/domain/weather_services/tendaylegendstrip'
import { rainfallIcons, cloudCoverIcons } from './legends_data'
import styles from './styles'

function TenDayForecast({ weather, onSelectItemChange }) {
  const provinces = useSelector((state) => state.provinces)
  const municipalities = useSelector((state) => state.municipalities)
  const tendayweather = useSelector((state) => state.tendayweather)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(false)

  useEffect(() => {
    const isLoading =
      provinces.status !== ADAPTER_STATES.FULLFILLED ||
      tendayweather.status !== ADAPTER_STATES.FULLFILLED

    if (provinces.error !== '' || tendayweather.error !== '') {
      setErrorMsg(true)
    }

    setLoading(isLoading)
  }, [
    provinces.status,
    tendayweather.status,
    provinces.error,
    tendayweather.error,
  ])

  return (
    <Box sx={styles.wrapper} id="contents-tenday-forecast">
      <Typography variant="h4">10-Day Weather Forecast</Typography>

      <Card
        variant="outlined"
        sx={styles.card}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
      >
        <Grid container maxWidth="lg" spacing={4} alignItems="bottom">
          {/** Location selector */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6">Location Selector</Typography>
              <Autocomplete
                disablePortal
                id="province"
                value={provinces.province}
                disabled={provinces.ids.length === 0 || loading}
                options={Object.values(provinces.entities)}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      provinces.province === null
                        ? 'Select a province'
                        : 'Province'
                    }
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
                onChange={(e, newValue) =>
                  onSelectItemChange(e, { ...newValue, from: 'province' })
                }
              />
              <Autocomplete
                disablePortal
                id="municipality"
                value={municipalities.municipality}
                disabled={municipalities.ids.length === 0 || loading}
                options={Object.values(municipalities.entities)}
                sx={styles.autoMuni}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      municipalities.municipality === null
                        ? 'Select a municipality'
                        : 'Municipality'
                    }
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
                getOptionDisabled={(option) => {
                  return option.iscalendar !== undefined
                }}
                onChange={(e, newValue) =>
                  onSelectItemChange(e, { ...newValue, from: 'municipality' })
                }
              />
            </Box>
          </Grid>

          {/** Data overview */}
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="h6">Data Overview</Typography>
              {!loading && !errorMsg && (
                <CaptionText>
                  <strong>Synced by:</strong>&nbsp;{' '}
                  {tendayweather.currentLogs.updated_by}
                  <br />
                  <strong>Valid Until:</strong>&nbsp;{' '}
                  {tendayweather.currentLogs.date_valid}
                  <br />
                  <strong>Date of Forecast:</strong>&nbsp;{' '}
                  {tendayweather.currentLogs.date_forecast}
                  <br />
                  <strong>Date synced:</strong>&nbsp;{' '}
                  {tendayweather.currentLogs.date_synced}
                  <br />
                  <br />
                  Synced from PAGASA&apos;s{' '}
                  <a
                    href="https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast"
                    target="_blank"
                    rel="noreferrer"
                  >
                    10-Day Climate Forecast
                  </a>{' '}
                  spreadsheet files by{' '}
                  {tendayweather.currentLogs.updated_by === 'system'
                    ? ''
                    : 'an'}{' '}
                  {tendayweather.currentLogs.updated_by} on{' '}
                  {tendayweather.currentLogs.date_synced}
                </CaptionText>
              )}
            </Box>
          </Grid>

          {/** Legends */}
          <Grid item xs={12} md={5}>
            {/** Legends */}
            <TendayLegends
              sideTitle="Rainfall Intensity"
              legendsData={rainfallIcons}
            />
            <TendayLegends
              sideTitle="Cloud Cover"
              legendsData={cloudCoverIcons}
            />
          </Grid>
        </Grid>

        <Grid container maxWidth="lg" sx={{ marginTop: '32px' }}>
          {loading && !errorMsg ? (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={32} />
              <Typography variant="caption">
                Loading municipalities...
              </Typography>
            </Box>
          ) : errorMsg ? (
            <EmptyState />
          ) : (
            weather.map((item, index) => (
              <DailyWeather key={`dw-${index}`} dailyweather={item} />
            ))
          )}
        </Grid>
      </Card>
    </Box>
  )
}

export default TenDayForecast
