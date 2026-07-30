import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Link from 'next/link'
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
import Recommendations from '@/domain/admin/bulletins/recommendations'
import SelectionSummary from '@/domain/admin/bulletins/selectionsummary'
import SimpleSnackbar from '@/common/ui/snackbar'

import { reportReset } from '@/store/reports/reportSlice'

import styles from '../seasonal/styles'

// UI Component for the admin create 10-day and special weather report
function CommonCreateReportComponent (props) {
  const [show, setShowRecommendations] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const { open, loading, isloadingreport, isdisabled } = props
  const { climateRisk, optsprovinces, optsmunicipalities, optscrops, optscropstages, optsactivities, recommendationsData, sel_options } = props
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
  const invalidYearErrorString = 'Invalid year'

  useEffect(() => {
    if (sel_options.sel_municipality === null && show === true) {
      setShowRecommendations(false)
    }
  }, [sel_options.sel_municipality, show])

  const handleCloseAction = () => {
    if (!report) {
      return
    }

    dispatch(reportReset())
    router.push(`/admin/bulletins/crops/report/view/?docId=${report.id}`)
  }

  const getProvinceLabel = () => {
    let label = 'Loading...'

    if (optsprovinces.length > 0) {
      label =
        sel_options.sel_province === null ? 'Select a province' : 'Province'
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
        openSnackbar={sel_options.error !== ''}
        message={sel_options.error}
        severity='warning'
      />

      {/** Create Recommendations Selectors ABZ */}
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
            <Autocomplete
              disablePortal
              id='province'
              size='small'
              value={sel_options.sel_province}
              disabled={
                optsprovinces.length === 0 ||
                sel_options.error.includes(invalidYearErrorString) ||
                loading
              }
              options={optsprovinces}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => <TextField {...params} label={getProvinceLabel()} />}
              getOptionDisabled={(option) => option.disabled}
              isOptionEqualToValue={(option, value) => option.label === value}
              onChange={(e, newValue) => onSelectItemChange(e, { ...newValue, from: 'province'})}
            />

            <Autocomplete
              disablePortal
              id='municipality'
              size='small'
              value={sel_options.sel_municipality}
              disabled={
                optsmunicipalities.length === 0 ||
                sel_options.error.includes(invalidYearErrorString) ||
                loading
              }
              options={optsmunicipalities}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => <TextField {...params} label={sel_options.sel_municipality === null ? 'Select a municipality' : 'Municipality'} />}
              getOptionDisabled={(option) => (option.disabled || option.iscalendar !== undefined)}
              isOptionEqualToValue={(option, value) => option.label === value}
              onChange={(e, newValue) => {
                onSelectItemChange(e, { ...newValue, from: 'municipality'})
                setShowRecommendations(false)
              }}
            />

            <Autocomplete
              disablePortal
              id='crop'
              size='small'
              value={sel_options.sel_crop}
              disabled={optscrops.length === 0 || loading || !sel_options.sel_municipality}
              options={optscrops}
              sx={styles.autocomplete}
              PaperComponent={AutocompleteBg}
              renderInput={(params) => <TextField {...params} label={sel_options.sel_crop === null ? 'Select a crop type' : 'Crop'}/>}
              isOptionEqualToValue={(option, value) => option.label === value}
              getOptionDisabled={(option) => option.disabled}
              onChange={(e, newValue) => {
                onSelectItemChange(e, { ...newValue, from: 'crop'})
                setShowRecommendations(false)
              }}
           />


          {sel_options.sel_municipality !== null &&
            <div style={{
              marginTop: '16px',
              float: 'left',
              textAlign: 'center',
              border: '1px solid #DCEDC8',
              padding: '5px 10px',
              borderRadius: '5px'
            }}>
              <Typography variant="subtitle1">
                <strong>Climate Risk:</strong>
              </Typography>
              {climateRisk}
            </div>
          }

          <ButtonGroup
            disableElevation
            size='small'
            aria-label='outlined button controls group'
            disabled={isloadingreport ||
              sel_options.sel_municipality === null ||
              sel_options.sel_crop === '-'}
            sx={{ marginTop: '16px', float: 'right' }}
          >
            <Button variant='outlined' disabled={loading || isloadingreport} onClick={resetSelections}>
              Reset
            </Button>
            <Button variant='contained'
              onClick={() => setShowRecommendations(prev => !prev)}
              disabled={(
                loading ||
                sel_options.sel_month === null ||
                optscropstages.length === 0 ||
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
            climateRisk={climateRisk}
            selecteditems={sel_options}
            cropstages={optscropstages?.map(activity => activity.label).toString().split(',').join(', ')}
            farmoperations={optsactivities.map(activity => activity.label).toString().split(',').join(', ')}
            loading={loading}
            reportType={pageTitle === 'Special Weather Bulletin' ? 'special' : 'tenday'}
          />
        </Grid>
      </Grid>

      {/** Recommendations Overview */}
      <Recommendations
        show={show}
        loading={loading}
        keyEng='practice'
        keyTag='practice_tagalog'
        sel_options={sel_options}
        recommendationsData={recommendationsData}
        // formTitle={pageTitle}
        // reportType='tenday'
        optsactivities={optsactivities}
        options={sel_options}
        smstext={smstext}
        isCreateDisabled={isdisabled}
        handlePreview={handlePreview}
        toggleViewerOpen={toggleViewerOpen}
        pdfPreview={pdfPreview}
        handleSave={togglePrompt}
      />
    </div>
  )
}

CommonCreateReportComponent.propTypes = {
  climateRisk: PropTypes.string,
  optsprovinces: PropTypes.array,
  optsmunicipalities: PropTypes.array,
  optscrops: PropTypes.array,
  optscropstages: PropTypes.array,
  optsactivities: PropTypes.array,
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

export default CommonCreateReportComponent
