import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// Wraps a well-formed <ul> inside a Box
const InfoBox = styled((props) => (
  <Box {...props} />
))(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  maxWidth: '500px',
  minHeight: '100px',
  border: '1px solid gray',
  borderRadius: '8px',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(3),
  '& ul': {
    listStyle: 'none',
    paddingLeft: theme.spacing(3)
  }
}))

export default InfoBox
