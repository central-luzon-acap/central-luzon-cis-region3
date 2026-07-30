import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import Link from 'next/link'

// Material UI Components
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

// Redux
import { setIsEnglishGlobal } from '@/store/dashboard/dashboardSlice'

// Constants
import { ADAPTER_STATES } from '@/store/constants'
import styles from '../recommendations/styles'

function RecommendationsSolo (props) {
  const { options, smstext, loading } = props
  const {
    handleSave,
    handlePreview,
    show = true,
    isCreateDisabled = false,
  } = props

  const dispatch = useDispatch()

  const {
    recommendations: rawRecommendations
  } = useSelector((state) => state.recommendations)

  const {
    error: reportError,
    status: reportLoading
  } = useSelector((state) => state.reports)

  const isEnglish = useSelector((state) => state.dashboard.isEnglish)

  const [tabValue, setTabValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(options.loading
      || reportLoading === ADAPTER_STATES.PENDING)
  }, [options.loading, reportLoading])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
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
        {value === index && (
          <Box sx={{ p: 3, whiteSpace: props.smsstyle }}>
            {children}
          </Box>
        )}
      </div>
    )
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  return (
    <Grid container sx={styles.container} gap={3}
      style={{ marginTop: '24px', padding: loading ? '16px' : '24px' }}
    >
      <Grid item sx={styles.item} xs={12} lg={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CircularProgress
            size={16}
            color="primary"
            sx={{ display: (loading) ? 'block' : 'none' }}
          />
        </Box>
        {(rawRecommendations?.length === 1 && show) &&
        <Box>
          {/** PDF Form and SMS Form Tabs */}
          <Box sx={{
            width: '100%',
            marginTop: {
              xs: '85px',
              lg: '0px'
            }
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="basic tabs example"
              >
                <Tab label="PDF FORM" {...a11yProps(0)} />
                <Tab label="SMS FORM" {...a11yProps(1)} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0} smsstyle='normal'>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <Typography variant="h4">
                  Impact Outlooks
                </Typography>

                <Chip
                  size='medium'
                  variant='outlined'
                  label={(isEnglish ? 'Tagalog' : 'English')}
                  onClick={() => dispatch(setIsEnglishGlobal())}
                  sx={{ width: '90px' }}
                />
              </Box>

              {/** Recommendations list - Impact Outlooks */}
              {(rawRecommendations?.length === 1) &&
              <Box sx={styles.recSeasonal}>
                <div
                  style={{ marginBottom: '80px' }}
                  dangerouslySetInnerHTML={{
                    __html: isEnglish
                      ? rawRecommendations[0]?.impact_outlook_english
                      : rawRecommendations[0]?.impact_outlook_tagalog
                    }}
                 />
              </Box>
              }

              <hr />

              {/** Recommendations list - Management Practices */}
              <Typography variant="h4" sx={{ marginTop: '32px' }}>
                Recommendations
              </Typography>

              <Box sx={styles.recSeasonal}>
                <div
                  style={{ marginBottom: '48px' }}
                  dangerouslySetInnerHTML={{
                    __html: isEnglish
                      ? rawRecommendations[0]?.management_recommendations_english
                      : rawRecommendations[0]?.management_recommendations_tagalog
                    }}
                 />
              </Box>

            </TabPanel>

            <TabPanel value={tabValue} index={1} smsstyle='pre-wrap'>
              {smstext}
            </TabPanel>
          </Box>
        </Box>
        }
      </Grid>

        {/** Report Control Buttons */}
      <Box
        sx={{
          marginBottom: '16px',
          width: '100%',
            display: (rawRecommendations?.length === 1 && show) ? 'block' : 'none',
        }}
        >
        <br />
        <Divider />
        <br />

        {reportError !== '' && (
          <Typography variant="caption" sx={{ color: 'red' }}>
            Error: {reportError}
          </Typography>
        )}

        <ButtonGroup
          size="large"
          aria-label="large button group"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px',
          }}
        >
          <Link href="/admin/bulletins/crops" passHref>
            <Button disabled={isLoading}>Cancel</Button>
          </Link>
          <Button
            onClick={handlePreview}
            disabled={isLoading}
          >
            <span style={{ display: (isLoading) ? 'none' : 'block' }}>
              Preview
            </span>{' '}
            &nbsp;
            <CircularProgress
              size={20}
              color="secondary"
              sx={{ display: (isLoading)? 'block' : 'none' }}
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disableElevation
            disabled={isLoading || isCreateDisabled}
          >
            Save
          </Button>
        </ButtonGroup>
      </Box>
    </Grid>
  )
}

RecommendationsSolo.propTypes = {
  options: PropTypes.object,
  smstext: PropTypes.string,
  isCreateDisabled: PropTypes.bool,
  show: PropTypes.bool,
  loading: PropTypes.bool,
  handleSave: PropTypes.func,
  handlePreview: PropTypes.func
}

export default RecommendationsSolo
