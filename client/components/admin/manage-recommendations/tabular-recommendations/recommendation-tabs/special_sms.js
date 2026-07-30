import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { changeCodeToLabel } from '@/utils/recommendations'

function SPECIAL_SMS_CONTENT({ selectedRow, cropType, action }) {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography variant="subtitle1">
          <strong>Crop:</strong>
        </Typography>
        &nbsp;
        <Typography variant="subtitle1">{selectedRow?.row.crop}</Typography>
      </div>
      <div style={{ display: 'flex' }}>
        <Typography variant="subtitle1">
          <strong>Wind Signal:</strong>
        </Typography>
        &nbsp;
        <Typography variant="subtitle1">
          {changeCodeToLabel(
            'wind_signal',
            selectedRow?.row.wind_signal,
            cropType,
          )}
        </Typography>
      </div>
      <Typography variant="subtitle1">
        <strong>SMS:</strong>
      </Typography>
      &nbsp;
      <Typography variant="subtitle1">{selectedRow?.row.sms}</Typography>
      <Box sx={{ marginTop: '16px' }}>
        {action === 'View' ? (
          <Typography variant="subtitle1">{selectedRow?.row.sms}</Typography>
        ) : (
          // TODO: add 160 characters validation
          <TextField
            fullWidth
            multiline
            minRows={3}
            id="sms"
            name="sms"
            label="Outlined"
            variant="outlined"
            defaultValue={selectedRow?.row.sms}
          />
        )}
      </Box>
    </>
  )
}

export default SPECIAL_SMS_CONTENT
