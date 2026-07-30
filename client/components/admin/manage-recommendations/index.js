import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import TabularRecommendations from './tabular-recommendations/tabularrecommendations'
import UploadRecommendations from './uploadrecommendations'

function ManageRecommendations() {
  const [tabValue, setTabValue] = useState(0)

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

  return (
    <div>
      <Typography variant="h5">Recommendations Management</Typography>

      <Box
        sx={{
          width: '100%',
          marginTop: {
            xs: '15px',
            lg: '25px',
          },
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="UPLOAD" {...a11yProps(0)} />
            <Tab label="MANAGE" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Manage Tab Content */}
        <TabPanel value={tabValue} index={0} smsstyle="normal">
          <UploadRecommendations />
        </TabPanel>

        {/* Upload Tab Content */}
        <TabPanel value={tabValue} index={1} smsstyle="normal">
          <TabularRecommendations />
        </TabPanel>
      </Box>
    </div>
  )
}

export default ManageRecommendations
