import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Link from 'next/link'

// Material UI Components
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton  from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Common Components
import AutocompleteBg from '@/common/ui/autocomplete_bg'
import ModalDialogWrapper from '@/common/ui/modal'
import PDFPreview from '../pdfpreview'
import RecommendationsSolo from '../recommendations_solo'
import SelectionSummary from '@/domain/admin/bulletins/selectionsummary'
import SimpleSnackbar from '@/common/ui/snackbar'

// Redux
import { reportReset } from '@/store/reports/reportSlice'

// Constants
import { WIND_SIGNAL_CODES } from '@/utils/constants'
import styles from '../seasonal/styles'

// UI Component for the admin create 10-day and special weather report
function SpecialReportComponent (props) {
  const [show, setShowRecommendations] = useState(false)

  const router = useRouter()
  const dispatch = useDispatch()

  const { open, loading, isloadingreport, isdisabled } = props
  const { optsprovinces, optsmunicipalities, optscrops, optswindsignals, sel_options } = props
  const { message, smstext, pageTitle = '', pageDescription = '', pdfPreview } = props

  const {
    handlePreview,
    handleSave,
    resetSelections,
    togglePrompt,
    toggleViewerOpen,
    onSelectItemChange
  } = props

  const { report } = useSelector((state) => state.reports)

  useEffect(() => {
    if (!show) return

    if (sel_options?.sel_signal?.code === WIND_SIGNAL_CODES.SIGNAL_0) {
      if (!sel_options?.sel_crop) {
        setShowRecommendations(false)
      }
    } else {
      if (!sel_options.sel_municipality) {
        setShowRecommendations(false)
      }
    }

  }, [sel_options?.sel_municipality, sel_options?.sel_crop, sel_options?.sel_signal, show])

  const handleCloseAction = () => {
    if (!report) {
      return
    }

    dispatch(reportReset())
    router.push(`/admin/bulletins/crops/report/view/?docId=${report.id}`)
  }

  const getSelectLabel = (params) => {
    const {
      options, valueNotNull,
      labelFetch,
      labelSelect = 'Select a province',
      labelValue = 'Province'
    } = params
    let label = labelFetch ?? 'Loading...'

    if (options.length > 0) {
      label =
        valueNotNull === null ? labelSelect : labelValue
    }

    return label
  }

  return (
    <div>
      {/** Report Save Success Modal Dialog */}
      <ModalDialogWrapper
        isOpen={message.isOpen}
        maxWidth='xs'
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

      <SimpleSnackbar
        openSnackbar={sel_options.error !== '' }
        message={sel_options.error}
        severity='warning'
      />

      {/** Create Recommendations Selectors */}
      <Grid container sx={styles.container}>
        <Box sx={styles.headerText}>
          <Box>
            <Typography variant='h5'>
              {pageTitle}
            </Typography>
            <p dangerouslySetInnerHTML={{ __html: pageDescription }} />
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
          <Typography variant='h6'>Selection Options</Typography>

          {/** Wind Signal selection */}
          <Autocomplete
            disablePortal
            id='signal'
            size='small'
            value={sel_options.sel_signal}
            disabled={
              optswindsignals.length === 0 ||
              sel_options.error !== '' ||
              loading
            }
            options={optswindsignals}
            sx={styles.autocomplete}
            PaperComponent={AutocompleteBg}
            renderInput={(params) => <TextField {...params} label={getSelectLabel({
                options: optswindsignals,
                valueNotNull: sel_options?.sel_signal,
                labelSelect: 'Select a wind signal',
                labelValue: 'Wind Signal'
              })}
            />}
            getOptionDisabled={(option) => option.disabled}
            isOptionEqualToValue={(option, value) => option.label === value}
            onChange={(e, newValue) => {
              onSelectItemChange(e, { ...newValue, from: 'signal' })
              setShowRecommendations(false)
            }}
          />

          {/** Crop selection */}
          <Autocomplete
            disablePortal
            id='crop'
            size='small'
            value={sel_options.sel_crop}
            disabled={
              !sel_options?.sel_signal ||
              optscrops.length === 0 ||
              sel_options.error !== '' ||
              loading}
            options={optscrops}
            sx={styles.autocomplete}
            PaperComponent={AutocompleteBg}
            renderInput={(params) => <TextField {...params} label={getSelectLabel({
                options: optscrops,
                valueNotNull: sel_options?.sel_crop,
                labelSelect: 'Select crop',
                labelValue: 'Crop'
              })}
            />}
            getOptionDisabled={(option) => option.disabled}
            isOptionEqualToValue={(option, value) => option.label === value}
            onChange={(e, newValue) => {
              onSelectItemChange(e, { ...newValue, from: 'crop' })
              setShowRecommendations(false)
            }}
          />

          {/** Province selection */}
          <Autocomplete
            disablePortal
            id='province'
            size='small'
            value={sel_options.sel_province}
            disabled={
              optsprovinces.length === 0 ||
              !sel_options?.sel_crop ||
              !sel_options?.sel_signal ||
              sel_options?.sel_signal?.value === 0 ||
              sel_options.error !== '' ||
              loading
            }
            options={optsprovinces}
            sx={styles.autocomplete}
            PaperComponent={AutocompleteBg}
            renderInput={(params) => <TextField {...params} label={getSelectLabel({
                options: optsprovinces,
                valueNotNull: sel_options?.sel_province,
                labelFetch: 'Select a province',
                labelSelect: 'Select a province',
                labelValue: 'Province'
              })}
            />}
            getOptionDisabled={(option) => option.disabled}
            isOptionEqualToValue={(option, value) => option.label === value}
            onChange={(e, newValue) => {
              onSelectItemChange(e, { ...newValue, from: 'province' })
            }}
          />

          {/** Municipality selection */}
          <Autocomplete
            disablePortal
            id='municipality'
            size='small'
            value={sel_options.sel_municipality}
            disabled={
              optsmunicipalities.length === 0 ||
              !sel_options?.sel_crop ||
              sel_options.error !== '' ||
              loading
            }
            options={optsmunicipalities}
            sx={styles.autocomplete}
            PaperComponent={AutocompleteBg}
            renderInput={(params) => <TextField {...params} label={sel_options.sel_municipality === null ? 'Select a municipality' : 'Municipality' } />}
            getOptionDisabled={(option) => (option.disabled || option.iscalendar !== undefined)}
            isOptionEqualToValue={(option, value) => option.label === value}
            onChange={(e, newValue) => {
              onSelectItemChange(e, { ...newValue, from: 'municipality' })
              setShowRecommendations(false)
            }}
          />

          <ButtonGroup
            disableElevation
            size='small'
            aria-label='outlined button controls group'
            disabled={isloadingreport || isdisabled}
            sx={{ marginTop: '16px', float: 'right' }}
          >
            <Button variant='outlined' disabled={loading || isloadingreport} onClick={resetSelections}>
              Reset
            </Button>
            <Button variant='contained'
              onClick={() => setShowRecommendations(prev => !prev)}
              disabled={(
                loading ||
                isdisabled ||
                sel_options.error !== '' ||
                show)}
            >
              Generate
            </Button>
          </ButtonGroup>
        </Grid>

        {/** Selection Summary */}
        <Grid item sx={styles.item} xs={12} lg={8}>
          <SelectionSummary
            selecteditems={sel_options}
            loading={loading}
            reportType='special'
          />
        </Grid>
      </Grid>

      {/** Recommendations Overview */}
      <RecommendationsSolo
        show={show}
        loading={loading}
        options={sel_options}
        smstext={smstext}
        isCreateDisabled={isdisabled}
        handlePreview={handlePreview}
        handleSave={togglePrompt}
      />
    </div>
  )
}

SpecialReportComponent.propTypes = {
  optsprovinces: PropTypes.array,
  optsmunicipalities: PropTypes.array,
  sel_options: PropTypes.object,
  loading: PropTypes.bool,
  isloadingreport: PropTypes.bool,
  isdisabled: PropTypes.bool,
  open: PropTypes.bool,
  message: PropTypes.object,
  smstext: PropTypes.string,
  pageTitle: PropTypes.string,
  pageDescription: PropTypes.string,
  pdfPreview: PropTypes.object,
  onSelectItemChange: PropTypes.func,
  handlePreview: PropTypes.func,
  handleSave: PropTypes.func,
  toggleViewerOpen: PropTypes.func,
  resetSelections: PropTypes.func,
  togglePrompt: PropTypes.func
}

export default SpecialReportComponent
