import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import styles from './styles'

function LoadingTable ({ rows = 3, cols = 3 }) {
  return (
    <Box sx={styles.container}>
      {Array.from(Array(rows).keys()).map((row, rowId) => (
        <div key={`row-${rowId}`} style={{ margin: '2px', display: 'flex' }}>
          {Array.from(Array(cols).keys()).map((col, colId) => (
            <Skeleton key={`col-${colId}`} animation="wave" variant="rectangular" height={25} sx={{ margin: '3px', width: `${Math.round(100 / cols)}%` }} />
          ))}
        </div>
      ))}
    </Box>
  )
}

export default LoadingTable
