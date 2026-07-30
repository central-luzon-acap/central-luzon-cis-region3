import Box from '@mui/material/Box'
import ReportProblemTwoToneIcon from '@mui/icons-material/ReportProblemTwoTone'
import Typography from '@mui/material/Typography'

function UnauthorizedAccess () {
  return (
    <Box sx={{
      display: 'grid',
      minHeight: '70vh',
      placeContent: 'center',
      textAlign: 'center'
    }}>
      <div>
        <ReportProblemTwoToneIcon sx={{ fontSize: 50, color: 'red' }} />
        <Typography variant='h5'>You are not authorized to access this page.</Typography>
      </div>
    </Box>
  )
}

export default UnauthorizedAccess
