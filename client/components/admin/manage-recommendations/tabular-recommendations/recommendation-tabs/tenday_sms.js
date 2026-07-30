import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { changeCodeToLabel } from '@/utils/recommendations'

function TENDAY_SMS_CONTENT({ selectedRow, action }) {
  return (
    <>
      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Crop:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {selectedRow?.row.crop}
          </Typography>
        </Box>
      </span>

      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Climate Risk:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {changeCodeToLabel(
              'climate_risk',
              selectedRow?.row.climate_risk,
              null,
            )}
          </Typography>
        </Box>
      </span>

      <Typography component="span" variant="subtitle1">
        <strong>SMS:</strong>
      </Typography>

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

export default TENDAY_SMS_CONTENT
