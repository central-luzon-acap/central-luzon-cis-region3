import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import EndButton from '@/common/ui/fileuploader/endbutton'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import UpdateSummaryDetails from '@/domain/admin/settings/updatesummary'
import MoonPhasesList from '@/domain/admin/settings/moonphaselist'
import styles from './styles'

const Input = styled('input')({
  display: 'none',
})

function TenDayWeatherPanel ({ files = [], status, logs, handleSubmit, handleSelectFiles }) {
  return (
    <Box sx={{ '& li': { fontSize: '14px' } }}>
      <Typography sx={{ marginTop: (theme) => theme.spacing(1) }} variant='h6'>10-Day Weather Forecast Updater</Typography>

      <Typography variant='body2' sx={styles.subheader}>
        ACAP&apos;s system updates its internal 10-Day Weather Forecast data by automatically downloading, parsing, and uploading the 10-day weather forecast excel files from PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast' target='_blank' rel="noreferrer">10-Day Climate Forecast</a> web page to ACAP&apos;s database.

        <br /><br />

        ACAP&apos;s daily automatic 10-Day Weather Forecast updating runs daily between 9:00 AM to 12:00 PM PH time.

        <br /><br />

        This panel updates the site&apos;s 10-Day Weather Forecast data by allowing admins to manually upload the excel files downloaded from PAGASA&apos;s web page. Follow the steps to update the site&apos;s 10-Day Weather Forecast data:
      </Typography>

      <ol>
        <li>Download all (10) excel files from PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/climate-prediction/10-day-climate-forecast' target='_blank' rel="noreferrer">10 Day Climate Forecast</a> web page.</li>
        <li>Press the SELECT FILES button and select all the excel files.</li>
        <li>Press the SUBMIT button.</li>
        <li>Wait for the upload process to finish.</li>
      </ol>

      <UpdateSummaryDetails title='Current Data Update Summary'>
        <ul>
          <li><strong>Updated by:</strong>&nbsp; {logs.updated_by}</li>
          <li><strong>Valid Until:</strong>&nbsp; {logs.date_valid}</li>
          <li><strong>Date of Forecast:</strong>&nbsp; {logs.date_forecast}</li>
          <li><strong>Date synced:</strong>&nbsp; {logs.date_synced}</li>
        </ul>
      </UpdateSummaryDetails>

      <Box sx={styles.upload}>
        {files.length === 0
          ? <span>Select excel files.</span>
          : <Box sx={{ '& div': { margin: '2px' } }}>
            {Array.from(files).map((x, index) => (
              <Chip key={`excel-${index}`} label={x.name} size='small' />
            ))}
          </Box>
        }
      </Box>
      <Box sx={styles.notification}>
        {(!status.loading && status.error !== '') &&
          <Alert severity='error'>{status.error}</Alert>}

        {(!status.loading && status.msg !== '') &&
          <Alert severity='success'>{status.msg}</Alert>}
      </Box>

      <label htmlFor='contained-button-file'>
        <Input accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
          id='contained-button-file' multiple type='file' name='excel-files' onChange={handleSelectFiles} disabled={status.loading} />
        <EndButton
          variant='text'
          component='span'
          size='small'
          disabled={status.loading}
          disableElevation
          sx={{ width: '110px' }}
        >
          Select Files
          <CircularProgress size={20} color='secondary' sx={{ display: (status.loading) ? 'block' : 'none' }} />
        </EndButton>
        <EndButton
          type='submit'
          variant='contained'
          size='small'
          onClick={handleSubmit}
          disabled={status.loading}
          disableElevation
          sx={{ width: '110px' }}
        >
          Submit
        </EndButton>
      </label>

      {/** Moon Phases List */}
      <MoonPhasesList />
    </Box>
  )
}

export default TenDayWeatherPanel
