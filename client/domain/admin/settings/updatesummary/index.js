import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InfoBox from './infobox'

function UpdateSummaryDetails (props) {
  return (
    <Box>
      {/** Title */}
      <Typography sx={{ marginTop: (theme) => theme.spacing(4) }} variant='h6'>
        {props.title}
      </Typography>

      {/** Content (ul, li) */}
      <InfoBox>
        {props.children}
      </InfoBox>
    </Box>
  )
}

export default UpdateSummaryDetails
