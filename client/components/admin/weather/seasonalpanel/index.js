import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import RainfallViewer from './viewer'
import CycloneList from '@/domain/admin/settings/cyclonelist'
import MiscSystemsList from '@/domain/admin/settings/misc_systems'

import { assetPrefixer } from '@/utils/img-loader'
import styles from './styles'

function SeasonalWeatherPanel () {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: (theme) => theme.spacing(1) }}>
        <Typography variant='h6'>
          Seasonal Weather Forecast Updater
        </Typography>
      </Box>

      <br />
      <Typography variant='h7'><strong>Upload an Excel File</strong></Typography>
      <Typography variant='body2' sx={styles.subheader}>
        Update ACAP&apos;s seasonal weather forecast rainfall, tropical cyclones, and weather systems affecting the region data by uploading the updated seasonal weather forecast raw data in the excel file provided by PAGASA by clicking the SEARCH button, followed by clicking the UPLOAD button under the <strong>Upload an Excel File</strong> option below.
        <br />
        <br />
        <b><span style={{ color: 'orange' }}>CAUTION:</span></b> Since PAGASA&apos;s shared seasonal Excel file has no year data, the seasonal Excel file upload will take the current year as a basis for the starting 1st seasonal month.
        <br />
        <br />
        You can use the attached seasonal weather forecast excel file from PAGASA as a template when uploading an excel file. The excel file should follow the format and structure of the attached sample.
        <br />
        <br />
        Write <span style={{ color: 'orange' }}><b>nda</b></span> for Excel cell values with &quot;no data available&quot; for given month or parameter.
        <br />
        <br />
        <label style={{ fontSize: '12px' }}>
        PAGASA&apos;s latest seasonal weather forecast is availabe on <a href="https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast" target="_blank" rel="noreferrer">PAGASA&apos; Seasonal (Rainfall) Forecast</a> web page for reference.
        </label>
        <br />
        <br />
        <a
          href={assetPrefixer(`files/${process.env.PAGASA_EXCEL_FILE}`)}
          target='__blank'
        >
          [Seasonal Forecast Excel template]
        </a>
      </Typography>

      <div>
        <RainfallViewer
          withBorder={true}
        />

        <CycloneList />

        <MiscSystemsList />
      </div>
    </div>
  )
}

export default SeasonalWeatherPanel
