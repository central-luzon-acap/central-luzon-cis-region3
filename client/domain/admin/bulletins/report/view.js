import { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

// Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import { Tab, Tabs } from '@mui/material/'
import Typography from '@mui/material/Typography'
import LoadingDocument from '@/common/ui/loadingdocument'
import EmptyState from '@/common/ui/empty_state'
import ModalDialogWrapper from '@/common/ui/modal'

// Constants
import { ADAPTER_STATES } from '@/store/constants'
import { REPORT_TITLE } from '@/utils/constants/app'
import { REPORT } from '@/hooks/reports/constants'

// Hooks
import useReportFields from '@/hooks/reports/usereportfields'

// Styles
import styles from '../seasonal/styles'
import stylesReport from './styles'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const theme = createTheme()

theme.typography.h5 = {
  fontSize: '1.2rem',
  '@media (min-width:600px)': {
    fontSize: '1.5rem'
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem'
  }
}

function TabPanel(props) {
  const { children, value, index, ...other } = props
  if (other.smallscreen) {
    other.smallscreen = other.smallscreen.toString()
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: other.smallscreen ? 2 : 3,
            whiteSpace: props?.smsstyle || 'normal'
          }}
        >
          {children}
        </Box>
      )}
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

function ViewCropsBulletin({
  report,
  loading,
  onBackBtnClick,
  onDeleteClick,
  onSmsBtnClick
}) {
  const [value, setValue] = useState(0)
  const { fieldValues } = useReportFields(report, [
    REPORT.REGION,
    REPORT.TYPE,
    REPORT.UID,
    REPORT.ID
  ])

  const { status: repLoading, error: repError } = useSelector(
    (state) => state.reports
  )

  const isScreenSizeBetweenXSandMD = useMediaQuery(
    theme.breakpoints.between('xs', 'md')
  )

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div>
      {loading || report.loading ? (
        <LoadingDocument />
      ) : report.stages !== undefined ? (
        <Box container sx={styles.container}>
          <Box
            sx={{
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <ThemeProvider theme={theme}>
              <Box>
                <Typography variant="h5">
                  Crop Recommendation Summary
                </Typography>
                <Typography variant="h6">
                  {REPORT_TITLE[report.type]}
                </Typography>
              </Box>
            </ThemeProvider>

            <ButtonGroup
              orientation={
                isScreenSizeBetweenXSandMD ? 'vertical' : 'horizontal'
              }
            >
              <Button
                disableElevation
                color="primary"
                sx={{
                  ...styles.button,
                  color: (theme) => theme.palette.primary.main
                }}
                variant="outlined"
                onClick={onSmsBtnClick}
              >
                SMS
              </Button>
              <ModalDialogWrapper
                isOpen={false}
                maxWidth="sm"
                openButtonText="Delete"
                title="Delete Report"
                contentText={
                  report.info !== ''
                    ? report.info
                    : 'Are you sure you want to delete this Bulletin report log?'
                }
                confirmBtnText={report.info !== '' ? 'Ok' : 'Delete'}
                modalConfirmHandlerCB={onDeleteClick}
                loading={repLoading === ADAPTER_STATES.PENDING}
                modalButtonStyles={{ borderRadius: 0, width: '100%' }}
              >
                {repError !== '' && (
                  <Typography variant="caption" sx={{ color: 'red' }}>
                    {repError}
                  </Typography>
                )}
              </ModalDialogWrapper>
              <Button
                disableElevation
                color="primary"
                variant="contained"
                sx={styles.button}
                onClick={onBackBtnClick}
              >
                Back
              </Button>
            </ButtonGroup>
          </Box>
          <div>
            <Box sx={stylesReport.details}>
              {fieldValues.map((item) => (
                <div key={item.id}>
                  <Typography variant="body2">
                    <strong>{item?.label}: </strong> {item?.value ?? '-'}
                  </Typography>
                </div>
              ))}
              <Typography variant="caption">
                <strong>ID:</strong> {report.id}
              </Typography>
            </Box>
            <Divider sx={{ marginTop: '32px' }} />
          </div>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="PDF FORM" {...a11yProps(0)} />
                <Tab label="SMS FORM" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel
              value={value}
              index={0}
              smallscreen={isScreenSizeBetweenXSandMD ? true : undefined}
              smsstyle="normal"
            >
              <Box
                sx={{
                  ...{
                    ul: isScreenSizeBetweenXSandMD
                      ? styles.pdfcontent.ul
                      : 'none'
                  },
                  ...{ hr: stylesReport.htmlReportHR },
                  ...stylesReport.content
                }}
                dangerouslySetInnerHTML={{ __html: report.recommendations }}
              ></Box>
            </TabPanel>
            <TabPanel value={value} index={1} smsstyle="pre-wrap">
              <Typography variant="body1" gutterBottom>
                {report.smsRecommendations || (
                  <span style={{ color: '#ff1744' }}>
                    No SMS Recommendations available.
                  </span>
                )}
              </Typography>
            </TabPanel>
          </Box>
        </Box>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

ViewCropsBulletin.propTypes = {
  report: PropTypes.object,
  loading: PropTypes.bool,
  onBackBtnClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onSmsBtnClick: PropTypes.func
}

export default ViewCropsBulletin
