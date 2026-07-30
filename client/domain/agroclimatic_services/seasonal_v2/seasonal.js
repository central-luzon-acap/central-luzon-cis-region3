import { useState, useEffect } from 'react'
import Image from 'next/image'
import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import AutocompleteBg from '@/common/ui/autocomplete_bg'
import SelectedItem from '@/domain/agroclimatic_services/selecteditem'
import RecommendationsList from '@/domain/agroclimatic_services/recommendationslistv2'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'

import Link from 'next/link'

import styles from '../styles'
const selections = ['sel_province', 'sel_crop', 'sel_stage', 'sel_activity']

function SeasonalRecommendationsV2Component(props) {
  const [show, setShowRecommendations] = useState(false)

  const { sel_options } = props
  const {
    climateRisk,
    seasonalMonths,
    optsprovinces,
    optscrops,
    optsmonths,
    optscropstages,
    optsactivities,
  } = props
  const { onSelectItemChange, onResetClick } = props
  const { croppingCalendar, recommendations, loading } = props

  useEffect(() => {
    if (
      sel_options.sel_activity === null &&
      show === true &&
      croppingCalendar.length !== 0
    ) {
      setShowRecommendations(false)
    }
  }, [sel_options.sel_activity, show, croppingCalendar])

  const getProvinceLabel = () => {
    let label = 'Loading...'

    if (optsprovinces.length > 0) {
      label =
        sel_options.sel_province === null ? 'Select a province' : 'Province'
    }

    return label
  }

  return (
    <Box sx={{ minHeight: '75vh' }} id="contents-seasonal-recommendations">
      <Typography variant="h4">Seasonal Recommendations</Typography>
      <Typography variant="subtitle1">Crop Recommendations</Typography>

      <Grid container spacing={2} sx={styles.container}>
        {/** Autocomplete selectors */}
        <Grid item xs={12} md={4} sx={styles.selectContainer}>
          <Box
            sx={{ paddingRight: (theme) => theme.spacing(2), wdith: '100%' }}
          >
            <Autocomplete
              disablePortal
              id="province"
              value={sel_options.sel_province}
              disabled={optsprovinces.length === 0 || loading}
              options={optsprovinces}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => (
                <TextField {...params} label={getProvinceLabel()} />
              )}
              isOptionEqualToValue={(option, value) => option.label === value}
              onChange={(e, newValue) =>
                onSelectItemChange(e, { ...newValue, from: 'province' })
              }
            />

            {sel_options.sel_province && (
              <Box sx={{ mt: 2 }}>
                <Typography align="center" variant="body1">
                  <strong>Seasonal Forecast Duration:</strong>
                </Typography>
                <Typography align="center" variant="body1">
                  {seasonalMonths[0]?.label} to {seasonalMonths[5]?.label}
                </Typography>
              </Box>
            )}

            <Autocomplete
              disablePortal
              id="crop"
              value={sel_options.sel_crop}
              disabled={
                optscrops.length === 0 ||
                loading ||
                sel_options.sel_province === null
              }
              options={optscrops}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    sel_options.sel_crop === null
                      ? 'Select a crop type'
                      : 'Crop'
                  }
                />
              )}
              isOptionEqualToValue={(option, value) => option.label === value}
              getOptionDisabled={(option) => option.disabled}
              onChange={(e, newValue) =>
                onSelectItemChange(e, { ...newValue, from: 'crop' })
              }
            />

            {optscropstages.length === 0 &&
              sel_options.sel_crop !== null &&
              !loading && (
                <div>
                  <Typography variant="caption" color="orange">
                    <strong>
                      No crop stages for this seasonal range for{' '}
                      {sel_options.sel_crop}.
                    </strong>
                  </Typography>

                  <br />
                  <Typography variant="caption">
                    See&nbsp;
                    <Link href="/cropping-calendar-v2" passHref>
                      <a
                        style={{ color: 'orange', fontWeight: 600 }}
                        target="_blank"
                      >
                        Cropping Calendar
                      </a>
                    </Link>
                    &nbsp;for reference.
                  </Typography>
                </div>
              )}

            <Autocomplete
              disablePortal
              id="cropstage"
              value={sel_options.sel_stage}
              disabled={optscropstages.length === 0 || loading}
              options={optscropstages}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    sel_options.sel_stage === null
                      ? 'Select a crop stage'
                      : 'Crop Stage'
                  }
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.label === value.label
              }
              getOptionDisabled={(option) => option.disabled}
              onChange={(e, newValue) =>
                onSelectItemChange(e, { ...newValue, from: 'cropstage' })
              }
            />

            <Autocomplete
              disablePortal
              id="activity"
              value={sel_options.sel_activity}
              disabled={optsactivities.length === 0 || loading}
              options={optsactivities}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    sel_options.sel_activity === null
                      ? 'Select an activity'
                      : 'Activity'
                  }
                />
              )}
              isOptionEqualToValue={(option, value) => option.label === value}
              onChange={(e, newValue) => {
                onSelectItemChange(e, { ...newValue, from: 'activity' })
                setShowRecommendations(false)
              }}
            />

            {/** Error information */}
            <div>
              {sel_options.error !== '' ? (
                <div
                  style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}
                >
                  {sel_options.error}
                </div>
              ) : (
                <div>&nbsp;</div>
              )}
            </div>

            {/** Buttons */}
            <ButtonGroup
              variant="text"
              disableElevation
              sx={{ width: '300px', margin: 'auto', marginTop: '16px' }}
            >
              <Button size="medium" disabled={loading} onClick={onResetClick}>
                Clear
              </Button>
              <Button
                size="medium"
                variant="contained"
                onClick={() => setShowRecommendations((prev) => !prev)}
                disabled={
                  (sel_options.sel_activity === null &&
                    !recommendations.length) ||
                  show
                }
              >
                Finish
              </Button>
            </ButtonGroup>
          </Box>

          <br />
          <Divider />
          <br />

          {climateRisk !== '' && optsmonths.length > 0 && (
            <Box sx={styles.conditionLegend}>
              <Typography variant="body2">
                Climate Risk for the season{' '}
                <strong>{optsmonths[0]?.label}</strong> to{' '}
                <strong>{optsmonths[5]?.label}</strong>:
              </Typography>
              <div>{climateRisk}</div>
            </Box>
          )}
        </Grid>

        {/** Recommendations Viewer */}
        <Grid item xs={12} md={8} sx={styles.recsContainer}>
          {sel_options.sel_crop !== null &&
          (sel_options.sel_activity !== null || recommendations.length) &&
          show ? (
            <RecommendationsList
              impactOutlookOnly={true}
              title={sel_options.sel_crop}
              recommendations={recommendations}
              /* Public Viewing */
            />
          ) : Object.values(sel_options).filter((x) => x).length > 1 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {selections.map((item, index) => {
                const info = {
                  from: item.slice(item.indexOf('_') + 1),
                  label: ['sel_stage'].includes(item)
                    ? sel_options[item]?.label ?? ''
                    : sel_options[item],
                }

                return sel_options[item] !== null &&
                  sel_options[item] !== undefined ? (
                  <SelectedItem
                    key={`card-opt-${index}`}
                    info={info}
                    show={index < selections.length - 1}
                  />
                ) : (
                  <div key={`card-opt-${index}`}></div>
                )
              })}
            </div>
          ) : (
            <Box sx={styles.welcome}>
              <Image
                unoptimized
                src={assetPrefixer('images/icons/finance.svg')}
                height={120}
                width={120}
                loader={imageLoader}
                alt="Empty data"
              />
              <Typography variant="h5">
                Welcome to the Crop Recommendations Page
              </Typography>
              <Typography variant="p">
                Please select a province to start.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

SeasonalRecommendationsV2Component.propTypes = {
  sel_options: PropTypes.object,
  optsprovinces: PropTypes.array,
  optscrops: PropTypes.array,
  optsmonths: PropTypes.array,
  optscropstages: PropTypes.array,
  optsactivities: PropTypes.array,
  seasonalMonths: PropTypes.array,
  recommendations: PropTypes.array,
  loading: PropTypes.bool,
  onSelectItemChange: PropTypes.func,
  onResetClick: PropTypes.func,
}

export default SeasonalRecommendationsV2Component
