import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Tab, Tabs } from '@mui/material'

import { reportReset } from '@/store/reports/reportSlice'

// Common Components
import AutocompleteBg from '@/common/ui/autocomplete_bg'
import ModalDialogWrapper from '@/common/ui/modal'
import PDFPreview from '../pdfpreview'
import RecommendationsList from '@/domain/agroclimatic_services/recommendationslistv2'
import SelectionSummary from '@/domain/admin/bulletins/selectionsummary'
import styles from './styles'

import { NO_DATA_AVAILABLE } from '@/utils/constants'

function CreateCropsBulletinsV2Component(props) {
  const [show, setShowRecommendations] = useState(false)

  const mounted = useRef(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)

  const { sel_options } = props
  const { recommendations, recommendationsImpacts } = props

  const {
    climateRisk,
    optsprovinces,
    optsactivities,
    optscrops,
    optscropstages,
    monthForecast,
    open,
    isTagalog,
    loading,
    isloadingreport,
    message,
    smstext
  } = props
  const {
    pdfPreview,
    handleSave,
    handlePreview,
    togglePrompt,
    toggleViewerOpen,
    toggleGlobalLanguage,
    onSelectItemChange,
    resetSelections
  } = props

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (sel_options.sel_month === null && show === true) {
      setShowRecommendations(false)
    }
  }, [sel_options.sel_month, show])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleCloseAction = () => {
    dispatch(reportReset())
    router.push(`/admin/bulletins/crops/report/view/?docId=${message.docId}`)
  }

  const getProvinceLabel = () => {
    let label = 'Loading...'

    if (optsprovinces.length > 0) {
      label =
        sel_options.sel_province === null ? 'Select a province' : 'Province'
    }

    return label
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    )
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    }
  }

  return (
    <div>
      {/** Report Save Success Modal Dialog */}
      <ModalDialogWrapper
        isOpen={message.isOpen}
        maxWidth="xs"
        openButtonText={null}
        title={message.title}
        contentText={message.msg}
        loading={message.loading}
        modalCancelHandlerCB={() => {
          if (message.savesuccess) {
            handleCloseAction()
          } else {
            togglePrompt()
          }
        }}
        modalConfirmHandlerCB={() => {
          if (message.savesuccess) {
            handleCloseAction()
          } else {
            handleSave()
          }
        }}
      />

      {/** PDF Preview Modal Dialog */}
      <PDFPreview
        open={open}
        pdfPreview={pdfPreview}
        error={sel_options.error}
        loading={sel_options.loading}
        toggleViewerOpen={toggleViewerOpen}
      />

      {/** Create Recommendations Selectors */}
      <Grid container sx={styles.container}>
        <Box sx={styles.headerText}>
          <Box>
            <Typography variant="h5">
              Regional Seasonal Climate Outlook and Advisory Crop
              Recommendations Bulletin
            </Typography>
            <p>
              Create <strong>Seasonal</strong> crop recommendations bulletins.
              Finalized bulletins will be automatically uploaded to the site for
              public download.
            </p>
          </Box>

          <Box>
            <IconButton aria-label="exit" size="medium">
              <Link href="/admin/bulletins/crops" passHref>
                <ArrowBackIcon fontSize="inherit" />
              </Link>
            </IconButton>
          </Box>
        </Box>

        {/** Selection Parameters */}
        <Grid item sx={styles.item} xs={12} lg={4}>
          <Typography variant="h6">Selection Options</Typography>
          <Autocomplete
            disablePortal
            id="province"
            size="small"
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

          <Autocomplete
            disablePortal
            id="crop"
            size="small"
            value={sel_options.sel_crop}
            disabled={
              optscrops.length === 0 ||
              sel_options.sel_municipality === null ||
              loading
            }
            options={optscrops}
            sx={styles.autocomplete}
            PaperComponent={AutocompleteBg}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  sel_options.sel_crop === null ? 'Select a crop type' : 'Crop'
                }
              />
            )}
            isOptionEqualToValue={(option, value) => option.label === value}
            getOptionDisabled={(option) => option.disabled}
            onChange={(e, newValue) =>
              onSelectItemChange(e, { ...newValue, from: 'crop' })
            }
          />

          {sel_options.sel_crop !== null && (
            <div
              style={{
                marginTop: '16px',
                float: 'left',
                textAlign: 'center',
                border: '1px solid #DCEDC8',
                padding: '5px 10px',
                borderRadius: '5px'
              }}
            >
              <Typography variant="subtitle1">
                <strong>Climate Risk:</strong>
              </Typography>
              {climateRisk}
            </div>
          )}

          <ButtonGroup
            disableElevation
            size="small"
            aria-label="outlined button controls group"
            disabled={
              isloadingreport ||
              sel_options.sel_crop === null ||
              sel_options.sel_month === null
            }
            sx={{ marginTop: '16px', float: 'right' }}
          >
            <Button
              variant="outlined"
              disabled={loading || isloadingreport}
              onClick={resetSelections}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowRecommendations((prev) => !prev)}
              disabled={
                loading ||
                sel_options.sel_month === null ||
                show ||
                recommendations === null
              }
            >
              Generate
            </Button>
          </ButtonGroup>
        </Grid>

        {/** Selection Summary */}
        <Grid item sx={styles.item} xs={12} lg={8}>
          <SelectionSummary
            climateRisk={climateRisk}
            selecteditems={sel_options}
            cropstages={optscropstages
              ?.map((activity) => activity.label)
              .toString()
              .split(',')
              .join(', ')}
            farmoperations={optsactivities
              .map((activity) => activity.label)
              .toString()
              .split(',')
              .join(', ')}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/** Recommendations Overview */}
      <Grid
        container
        sx={styles.container}
        gap={3}
        style={{ marginTop: '24px', padding: loading ? '16px' : '24px' }}
      >
        <Grid item sx={styles.item} xs={12} lg={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <CircularProgress
              size={16}
              color="primary"
              sx={{ display: loading ? 'block' : 'none' }}
            />
          </Box>
          {sel_options.sel_crop !== null &&
            sel_options.sel_month !== null &&
            show && (
              <Box>
                {/** PDF Form and SMS Form Tabs */}
                {monthForecast.forecast !== NO_DATA_AVAILABLE && (
                  <Box
                    sx={{
                      width: '100%',
                      marginTop: {
                        xs: '85px',
                        lg: '0px'
                      },
                      '& hr': {
                        marginBottom: '32px'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& hr': { color: 'red' }
                      }}
                    >
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="basic tabs example"
                      >
                        <Tab label="PDF FORM" {...a11yProps(0)} />
                        <Tab label="SMS FORM" {...a11yProps(1)} />
                      </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '24px'
                        }}
                      >
                        <Typography variant="h4">Impact Outlooks</Typography>

                        <Chip
                          size="medium"
                          variant="outlined"
                          label={isTagalog ? 'English' : 'Tagalog'}
                          onClick={() => toggleGlobalLanguage()}
                          sx={{ width: '90px' }}
                        />
                      </Box>

                      {/** Recommendations list - Impact Outlooks */}
                      <Box sx={styles.recSeasonal}>
                        <RecommendationsList
                          impactOutlookOnly={true}
                          isShowImpactOutlookSubtitle={false}
                          recommendations={recommendationsImpacts}
                          impactOutlookEng="impact"
                          impactOutlookTag="impact_tagalog"
                          title={sel_options.sel_crop}
                          isTagalog={isTagalog}
                          isShowTitle={false}
                        />
                      </Box>

                      <hr />

                      <Typography variant="h4">Recommendations</Typography>

                      {/** Recommendations list */}
                      {recommendations && optscropstages ? (
                        Object.keys(recommendations)?.map(
                          (stagegroup, sIndex) => (
                            <React.Fragment key={sIndex}>
                              <Typography
                                variant="h5"
                                sx={styles.recSeasonalStage}
                              >
                                {stagegroup}
                              </Typography>
                              {Object.keys(recommendations[stagegroup]).map(
                                (activitygroup, oIndex) => (
                                  <Box
                                    key={`rec-${oIndex}`}
                                    sx={{
                                      ...styles.recSeasonal,
                                      ...{
                                        marginBottom: '24px',
                                        '& h6': { color: 'rgba(0, 0, 0, 0.67)' }
                                      }
                                    }}
                                  >
                                    <Typography variant="h6">
                                      {activitygroup}
                                    </Typography>

                                    <RecommendationsList
                                      recommendations={
                                        recommendations[stagegroup][
                                          activitygroup
                                        ]
                                      }
                                      isTagalog={isTagalog}
                                      isShowTitle={false}
                                    />
                                  </Box>
                                )
                              )}
                            </React.Fragment>
                          )
                        )
                      ) : (
                        <RecommendationsList
                          recommendations={recommendations}
                          isTagalog={isTagalog}
                          isShowTitle={false}
                        />
                      )}
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                      {smstext}
                    </TabPanel>
                  </Box>
                )}
              </Box>
            )}
        </Grid>

        {/** Report Control Buttons */}
        <Box
          sx={{
            marginBottom: '16px',
            width: '100%',
            display: show ? 'block' : 'none'
          }}
        >
          <br />
          <Divider />
          <br />

          {sel_options.error !== '' && (
            <Typography variant="caption" sx={{ color: 'red' }}>
              Error: {sel_options.error}
            </Typography>
          )}

          {/* <Box style={{ textAlign: 'right' }}>
            <Typography
              variant="caption"
              color="orange"
              style={{ fontWeight: '700' }}
            >
              Cannot Preview or Save yet. Currently under development.
            </Typography>
          </Box> */}
          <ButtonGroup
            size="large"
            aria-label="large button group"
            disabled={
              isloadingreport || monthForecast.forecast === NO_DATA_AVAILABLE
            }
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}
          >
            <Link href="/admin/bulletins/crops" passHref>
              <Button disabled={sel_options.loading}>Cancel</Button>
            </Link>
            <Button
              disabled={sel_options.loading}
              // disabled={true}
              onClick={handlePreview}
            >
              <span style={{ display: isloadingreport ? 'none' : 'block' }}>
                Preview
              </span>{' '}
              &nbsp;
              <CircularProgress
                size={24}
                color="secondary"
                sx={{ display: isloadingreport ? 'block' : 'none' }}
              />
            </Button>
            <Button
              variant="contained"
              onClick={togglePrompt}
              disableElevation
              disabled={sel_options.loading}
              /* disabled={true} */
            >
              Save
            </Button>
          </ButtonGroup>
        </Box>
      </Grid>
    </div>
  )
}

CreateCropsBulletinsV2Component.propTypes = {
  optsprovinces: PropTypes.array,
  optscrops: PropTypes.array,
  optsmonths: PropTypes.array,
  optsactivities: PropTypes.array,
  sel_options: PropTypes.object,
  monthForecast: PropTypes.object,
  // recommendations: PropTypes.object,
  recommendationsImpacts: PropTypes.array,
  loading: PropTypes.bool,
  isloadingreport: PropTypes.bool,
  open: PropTypes.bool,
  isTagalog: PropTypes.bool,
  message: PropTypes.object,
  smstext: PropTypes.string,
  pdfPreview: PropTypes.object,
  onSelectItemChange: PropTypes.func,
  handlePreview: PropTypes.func,
  handleSave: PropTypes.func,
  toggleViewerOpen: PropTypes.func,
  toggleGlobalLanguage: PropTypes.func,
  resetSelections: PropTypes.func,
  togglePrompt: PropTypes.func
}

export default CreateCropsBulletinsV2Component
