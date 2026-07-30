import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

function LoadingCircle ({ text = '', size = 24, children }) {
  return (
    <Box sx={{ width: '100%', textAlign: 'center', height: '20vh' }}>
      <Box sx={{ width: '100%', textAlign: 'center', marginTop: (theme) => theme.spacing(12), marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
        <span>{text !== '' ? text : 'Loading...'}</span> &nbsp;
        <CircularProgress size={size} />
      </Box>
      {children}
    </Box>
  )
}

export default LoadingCircle
