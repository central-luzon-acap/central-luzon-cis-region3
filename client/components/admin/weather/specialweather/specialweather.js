import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SimpleSnackbar from '@/common/ui/snackbar'
import UpdateSummaryDetails from '@/domain/admin/settings/updatesummary'
import WindSignalList from '@/domain/admin/settings/windsignal/windsignallist'
import styles from '../ten_panel/styles'

function SpecialWeather ({ state, cycloneLoading, onSyncPress }) {
  return (
    <Box sx={{ fontSize: '14px' }}>
      <SimpleSnackbar
        openSnackbar={state.error !== '' || state.msg !== ''}
        message={(state.error !== '') ? state.error : state.msg}
        severity={(state.error !== '') ? 'error' : 'success'}
      />

      <Typography
        sx={{ marginTop: (theme) => theme.spacing(1) }}
        variant='h6'
      >
          Tropical Cyclone Bulletin Updater
      </Typography>

      <Typography variant='body2' sx={styles.subheader}>
        ACAP&apos;s system updates its <strong>Special Weather Advisory</strong> information by automatically scanning, extracting, and uploading the latest Tropical Cyclone data from PAGASA&apos;s <strong><a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin" target="_blank" rel="noreferrer">Tropical Cyclone Bulletin</a></strong> web page to ACAP&apos;s database.

        <br /><br />

        ACAP&apos;s  automatic Special Weather Advisory updates run daily every (2) two hours, starting from midnight PH time, with a lag time of 20 minutes to (1) one and a half hours.

        <br /><br />

        This panel updates ACAP&apos;s <strong>Special Weather Advisory</strong> content by manually initiating the  process of syncing PAGASA&apos;s latest published tropical cyclone data from their <strong><a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin" target="_blank" rel="noreferrer">Tropical Cyclone Bulletin</a></strong> web page to ACAP.
      </Typography>

      <Typography variant='body2' sx={styles.subheader}>
        Press the SYNC button below to start the data syncing process.
      </Typography>

      <UpdateSummaryDetails title='Current Data Update Summary'>
        {!cycloneLoading &&
        <ul>
          <li><strong>Updated by:</strong>&nbsp; {state.updated_by}</li>
          <li><strong>Date synced:</strong>&nbsp; {state.date_updated}</li>
          <li><strong>Summary:</strong>&nbsp; {state.summary}</li>
        </ul>}
      </UpdateSummaryDetails>

      <Button
        variant='contained'
        onClick={onSyncPress}
        disabled={cycloneLoading || state.loading}
      >
        Sync
      </Button>

      <hr />

      {/** Wind Speed Input */}
      <WindSignalList />
    </Box>
  )
}

export default SpecialWeather
