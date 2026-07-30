import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'

function LoadingCyclone () {
  return (
    <Box sx={{ width: '100%', marginTop: (theme) => theme.spacing(4) }}>
      <Grid container spacing={5}>
        <Grid item sm={12} md={6}>
          {[1,2,3,4,5,6,7,8].map(item => (
            <Skeleton key={item} variant='text' />
          ))}
        </Grid>

        <Grid item sm={12} md={6}>
          <Skeleton
            animation='wave'
            variant='rectangular'
            height={450}
            sx={{ minWidth: '540px' }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default LoadingCyclone
