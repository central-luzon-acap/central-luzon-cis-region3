import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { MONTH_LABELS } from '@/utils/constants'

import styles from './styles'

function SpacerRow () {
  return (
    <Grid container sx={styles.calendar}>
      <Grid item xs={2} md={3} className='calendar-header-csystem'></Grid>
        <Grid item xs={10} md={9}  className='calendar-header-months'>
          {Object.values(MONTH_LABELS).map((item, index) => (
            <Box className='cal-mo-container' style={{ borderRight: '1px solid rgba(0, 0, 0, 0.4)' }} key={`cal-mo-itm-${index}-1`}>
              <div className='cropCalnocolor'></div>
            </Box>
          ))}
      </Grid>
    </Grid>
  )
}

export default SpacerRow
