import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { TabPanel, a11yProps } from '@/common/ui/tabcontent'
import PaperBgSoft from '@/common/ui/paperbgsoft'
import Typography from '@mui/material/Typography'
import SeasonalWeatherPanel from './seasonalpanel'
import TenDayWeatherContainer from './ten_panel'
import SpecialWeatherContainer from './specialweather'
import SupportServices from './support_services'
import { getFirestoreDateTimeString } from '@/utils/date'
import styles from './styles'

function AdminWeather() {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div>
      <PaperBgSoft sx={{ border: 'none' }}>
        <Typography variant="h5">Weather Services Updater</Typography>
        <p>
          Update the site-wide <strong>ACAP Services</strong> weather forecast
          information for the <strong>Seasonal</strong>, <strong>10-Day</strong>{' '}
          and <strong>Special Weather</strong> Forecast sections by providing
          updated data.
        </p>
        <p>
          Please take caution in updating this information because they will be
          automatically referenced by all site admins when creating crop
          recommendations bulletins on the{' '}
          <strong>Create Crop Bulletins</strong> (10-Day and Seasonal) Admin
          pages. Global data updates made by admins are also viewable on the
          site&apos;s public <strong>ACAP Services</strong> page and used as
          references on the <strong>Crop Recommendations</strong> page.
        </p>
      </PaperBgSoft>

      <Box sx={styles.tabsContainer}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="weather services updater"
        >
          <Tab label="Seasonal" {...a11yProps(0)} />
          <Tab label="10-Day" {...a11yProps(1)} />
          <Tab label="Tropical Cyclone" {...a11yProps(2)} />
          <Tab label="Support Services" {...a11yProps(3)} />
        </Tabs>
        <Box>
          <TabPanel value={value} index={0}>
            <SeasonalWeatherPanel />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <TenDayWeatherContainer
              getDateToString={getFirestoreDateTimeString}
            />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <SpecialWeatherContainer
              getDateToString={getFirestoreDateTimeString}
            />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <SupportServices />
          </TabPanel>
        </Box>
      </Box>
    </div>
  )
}

export default AdminWeather
