import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const CaptionText = styled((props) => (
  <Typography component='p' variant='caption' {...props} />
))(({ theme }) => ({
  color: theme.palette.text.secondary,
  '& a': {
    color: theme.palette.green.dark,
    textDecoration: 'none'
  },
  '& a:visited': {
    color: theme.palette.green.dark
  },
  '& a:hover, span:hover': {
    textDecoration: 'underline'
  }
}))

export default CaptionText
