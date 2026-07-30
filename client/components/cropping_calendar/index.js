import PropTypes from 'prop-types'
import useMediaQuery from '@mui/material/useMediaQuery'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import EmptyState from '@/common/ui/empty_state'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LoadingCircle from '@/common/ui/loadingcircle'
import SpacerRow from './spacer'
import { MONTH_LABELS } from '@/utils/constants'
import styles from './stylesV2'

function CroppingCalendarV2Component(props) {
  const {
    optsprovinces,
    optsmunicipalities,
    subcalendar,
    processedCalendar,
    cropStages,
    cropList,
  } = props

  const { sel_options, loading } = props
  const { onSelectItemChange } = props

  const CROP_TYPES = [
    { value: 'Rice', label: 'Rice' },
    { value: 'Pili', label: 'Pili' },
    { value: 'Corn', label: 'Corn' },
    { value: 'Ampalaya', label: 'Ampalaya' },
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Cucumber', label: 'Cucumber' },
    { value: 'PoleSitao', label: 'PoleSitao' },
    { value: 'Cassava', label: 'Cassava' },
    { value: 'Coconut', label: 'Coconut' },
    { value: 'Pineapple', label: 'Pineapple' },
    { value: 'Abaca', label: 'Abaca' },
    { value: 'Cutflowers', label: 'Cut-Flowers' },
    { value: 'Livestock', label: 'Livestock' },
    { value: 'Poultry', label: 'Poultry' },
    { value: 'Fisheries', label: 'Fisheries (brackish and freshwater)' },
  ]

  const handleChange = (e) => {
    onSelectItemChange(e, { label: e.target.value, from: e.target.value })
  }

  const sortedCropStages = Object.values(cropStages).sort(
    (a, b) => a.index - b.index,
  )

  const isScreenSizeXS = useMediaQuery('(max-width:600px)')

  return (
    <Card variant="outlined" sx={styles.card}>
      <Grid
        container
        maxWidth="lg"
        spacing={5}
        alignItems="bottom"
        sx={{ marginBottom: '48px' }}
      >
        {/** Province, Municipality selector menus */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="h6">Location Selector</Typography>

            <Autocomplete
              disablePortal
              id="province"
              size="small"
              value={sel_options.sel_province}
              disabled={optsprovinces.length === 0 || loading}
              options={optsprovinces}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    optsprovinces.length === 0
                      ? 'Loading...'
                      : 'Select a province'
                  }
                />
              )}
              isOptionEqualToValue={(option, value) => option.label === value}
              onChange={(e, newValue) =>
                onSelectItemChange(e, { ...newValue, from: 'province' })
              }
            />

            <Autocomplete
              disablePortal
              id="municipality"
              size="small"
              value={sel_options.sel_municipality}
              disabled={optsmunicipalities.length === 0 || loading}
              options={optsmunicipalities}
              sx={styles.autoMuni}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    sel_options.sel_municipality === null
                      ? 'Select a municipality'
                      : 'Municipality'
                  }
                />
              )}
              isOptionEqualToValue={(option, value) => option.label === value}
              getOptionDisabled={(option) => option.disabled}
              onChange={(e, newValue) =>
                onSelectItemChange(e, { ...newValue, from: 'municipality' })
              }
            />
          </Box>
        </Grid>

        {/** Crop Type selector */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6">Crop Type</Typography>
            <Box sx={{ maxWidth: 300 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Crop Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sel_options.sel_crop}
                  label="Crop Type"
                  onChange={handleChange}
                >
                  {CROP_TYPES.map((cropType) => {
                    return (
                      <MenuItem
                        key={cropType.value}
                        disabled={!cropList.includes(cropType.value)}
                        value={cropType.value}
                      >
                        {cropType.label}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/** Crop Calendar Main Viewport */}
      {loading && sel_options.error === '' ? (
        <LoadingCircle text="Loading data..." />
      ) : sel_options.error !== '' ? (
        <EmptyState message="Error loading data." />
      ) : (subcalendar === null || subcalendar === undefined) &&
        sel_options.sel_municipality !== null &&
        sel_options.sel_province !== null ? (
        <Box sx={styles.infoMsg}>
          Data for the requested resource is not yet available.
        </Box>
      ) : subcalendar !== null && processedCalendar.length !== 0 ? (
        <Box>
          <Grid container sx={styles.calendar}>
            {/** Cropping System Label */}
            <Grid item xs={2} md={3} className="calendar-header-csystem">
              <Typography variant="subtitle1">
                <strong>Crop Name</strong>
              </Typography>
            </Grid>

            {/** Month Labels */}
            <Grid item xs={10} md={9} className="calendar-header-months">
              {Object.values(MONTH_LABELS).map((item, index) => (
                <Box key={`cal-mo-${index}`} className="monthlabels">
                  {isScreenSizeXS ? (
                    <span>{item.format.substring(0, 1)}</span>
                  ) : (
                    <span>{item.format.substring(0, 3)}</span>
                  )}
                </Box>
              ))}
            </Grid>
          </Grid>

          {/** Main Crop Calendar strip */}
          <div>
            {/** Spacer row */}
            <SpacerRow />

            {/** Cropping Calendar content */}
            <Grid container sx={styles.calendar}>
              <Grid
                item
                xs={2}
                md={3}
                className="calendar-header-csystem cropcal-cropname"
              >
                {sel_options.sel_crop}
              </Grid>

              <Grid item xs={10} md={9} className="calendar-header-months">
                {Object.values(MONTH_LABELS).map((item, index) => {
                  const noColor =
                    processedCalendar[0][item.code].length <= 1
                      ? '1px solid rgba(0, 0, 0, 0.4)'
                      : ''

                  let firstHalf =
                    styles.calendar.cellBorderColor[
                      processedCalendar[0][item.code][0]
                    ]
                  let secondHalf =
                    styles.calendar.cellBorderColor[
                      processedCalendar[0][item.code][1]
                    ]

                  return (
                    <Box
                      className="cal-mo-container"
                      key={`cal-mo-itm-${index}-1`}
                      style={{
                        borderRight:
                          noColor !== ''
                            ? noColor
                            : secondHalf?.includes('#f7f7ff')
                            ? '1px solid rgba(0, 0, 0, 0.4)'
                            : `1px solid ${secondHalf}`,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: !firstHalf ? '#f7f7ff' : firstHalf,
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: !secondHalf ? '#f7f7ff' : secondHalf,
                        }}
                      ></div>
                    </Box>
                  )
                })}
              </Grid>
            </Grid>

            <Grid container sx={styles.calendar}>
              <Grid
                item
                xs={2}
                md={3}
                className="calendar-header-csystem cropcal-cropname"
              ></Grid>

              <Grid
                item
                xs={10}
                md={9}
                className="calendar-header-months"
                style={{ borderTop: '1px solid black' }}
              >
                {Object.values(MONTH_LABELS).map((item, index) => {
                  const noColor =
                    processedCalendar[1][item.code].length <= 1
                      ? '1px solid rgba(0, 0, 0, 0.4)'
                      : ''

                  let firstHalf =
                    styles.calendar.cellBorderColor[
                      processedCalendar[1][item.code][0]
                    ]
                  let secondHalf =
                    styles.calendar.cellBorderColor[
                      processedCalendar[1][item.code][1]
                    ]

                  return (
                    <Box
                      className="cal-mo-container"
                      key={`cal-mo-itm-${index}-1`}
                      style={{
                        borderRight:
                          noColor !== ''
                            ? noColor
                            : secondHalf?.includes('#f7f7ff')
                            ? '1px solid rgba(0, 0, 0, 0.4)'
                            : `1px solid ${secondHalf}`,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: !firstHalf ? '#f7f7ff' : firstHalf,
                        }}
                      ></div>
                      <div
                        style={{
                          backgroundColor: !secondHalf ? '#f7f7ff' : secondHalf,
                        }}
                      ></div>
                    </Box>
                  )
                })}
              </Grid>
            </Grid>

            {/** Spacer row */}
            <SpacerRow />
          </div>

          <Grid container style={{ marginTop: '32px' }}>
            {/** Legend */}
            <Grid item xs={2} md={3} className="calendar-header-csystem" />
            <Grid
              item
              xs={10}
              md={9}
              sx={styles.legend}
              className="calendar-header-months"
            >
              <strong>Legend</strong>
              <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sortedCropStages.map((stage) => {
                  return (
                    <li key={stage.index}>
                      <span
                        style={{
                          backgroundColor:
                            styles.calendar.cellBorderColor[
                              `cropCal${stage.index}`
                            ],
                        }}
                      ></span>
                      {stage.label}
                    </li>
                  )
                })}
              </ul>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={styles.infoMsg}>
          Please select a province and a municipality.
        </Box>
      )}
    </Card>
  )
}

CroppingCalendarV2Component.propTypes = {
  optsprovinces: PropTypes.array,
  optsmunicipalities: PropTypes.array,
  subcalendar: PropTypes.array,
  processedCalendar: PropTypes.array,
  cropStages: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  cropList: PropTypes.array,
  sel_options: PropTypes.object,
  loading: PropTypes.bool,
  onSelectItemChange: PropTypes.func,
}

export default CroppingCalendarV2Component
