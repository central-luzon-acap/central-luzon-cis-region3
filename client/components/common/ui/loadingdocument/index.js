import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import styles from './styles'

function LoadigDocument () {
  return (
    <Box sx={styles.container}>
      <Box sx={{ width: '300px' }}>
        {[1,2,3,4,5,6,7,8].map(item => (
          <Skeleton key={`up-${item}`} variant='text' />
        ))}
      </Box>
      <Divider sx={styles.divider} />
      <Box>
        {[1,2,3,4,5,6,7,8].map(item => (
          <Skeleton key={`down-${item}`} variant='rectangular' sx={styles.text} />
        ))}
      </Box>
    </Box>
  )
}

export default LoadigDocument
