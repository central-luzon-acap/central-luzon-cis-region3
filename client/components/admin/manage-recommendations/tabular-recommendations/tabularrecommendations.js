import { useState } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import DataGridRecommendations from './datagridrecommendations'

import useFetchAllCropRecommendations from '@/hooks/recommendationsv2/usefetchallrecommendations'
import useFetchCropStages from '@/hooks/cropping_calendar/usefetchcropstages'
import { Typography } from '@mui/material'

const CROP_TYPES = ['Rice', 'Corn', 'Cassava', 'PoleSitao', 'Ampalaya', 'Tomato','Cucumber']
const TABS = [
  {
    index: 0,
    label: 'Ten Day',
    value: 'tenday',
  },
  {
    index: 1,
    label: 'Ten Day SMS',
    value: 'tenday_sms',
  },
  {
    index: 2,
    label: 'Seasonal',
    value: 'seasonal',
  },
  {
    index: 3,
    label: 'Seasonal General',
    value: 'seasonal_general',
  },
  {
    index: 4,
    label: 'Seasonal SMS',
    value: 'seasonal_sms',
  },
  {
    index: 5,
    label: 'Special',
    value: 'special',
  },
  {
    index: 6,
    label: 'Special SMS',
    value: 'special_sms',
  },
]

function TabularRecommendations() {
  const [cropType, setCropType] = useState('Rice')
  const [tab, setTab] = useState({
    index: 0,
    label: 'Ten Day',
    value: 'tenday',
  })
  const [tabValue, setTabValue] = useState(0)
  const { selectedStages, loading: loadingStages } = useFetchCropStages(
    '10-day',
    cropType,
  )
  const { selectedStages: selectedSeasonalStages, loading: loadingSeasonalStages } = useFetchCropStages(
    'seasonal',
    cropType,
  )
  const { recommendations, loading, error } = useFetchAllCropRecommendations(
    cropType,
    tab.value,
  )

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setTab(TABS[newValue])
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
          <Box sx={{ p: 3, whiteSpace: props.smsstyle }}>{children}</Box>
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

  const handleChange = (event) => {
    setCropType(event.target.value)
  }

  return (
    <div>
      <p>
        <strong>Manage recommendations</strong> by viewing, adding, editing,
        deleting a recommendation.
      </p>

      <Box sx={{ width: 200, marginTop: '30px' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Crop Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={cropType}
            label="Crop Type"
            onChange={handleChange}
          >
            {CROP_TYPES.map((cropType) => {
              return (
                <MenuItem key={cropType} value={cropType}>
                  {cropType}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          width: '100%',
          marginTop: {
            xs: '15px',
            lg: '25px',
          },
          textAlign: 'center',
        }}
      >
        {loading || loadingStages || loadingSeasonalStages ? (
          <div sx={{ display: 'flex', justifyContent: 'center' }}>
            <span>Loading...</span>
            <CircularProgress size={24} color="primary" />
          </div>
        ) : (
          <>
            {error ? (
              <Typography variant="body1" color="error">
                Something went wrong. Unable to retrieve recommendations.
              </Typography>
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="basic tabs example"
                  >
                    {TABS.map((tab, index) => (
                      <Tab
                        key={index}
                        label={tab.label}
                        {...a11yProps(index)}
                      />
                    ))}
                  </Tabs>
                </Box>

                <TabPanel value={tab.index} index={tab.index}>
                  {selectedStages !== null && (
                    <DataGridRecommendations
                      rows={recommendations}
                      tab={tab}
                      cropType={cropType}
                      cropStages={selectedStages}
                      seasonalCropStages={selectedSeasonalStages}
                    />
                  )}
                </TabPanel>
              </>
            )}
          </>
        )}
      </Box>
    </div>
  )
}

export default TabularRecommendations
