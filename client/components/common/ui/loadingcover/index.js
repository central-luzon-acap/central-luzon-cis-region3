import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import styles from './styles'

function LoadingCover ({ sx }) {
  return (
    <Box sx={{
      ...styles.container,
      ...(sx && { ...sx })
    }}>
      <Box sx={styles.loading}>
        <Typography variant='subtitle1'>Loading...</Typography>
        <CircularProgress size='32px' />
      </Box>
    </Box>
  )
}

export default LoadingCover
