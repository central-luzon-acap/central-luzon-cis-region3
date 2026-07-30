import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

const ImageGrid = styled((props) => (
  <Grid {...props}  />
))(({ theme }) => ({
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  '& a': {
    color: 'rgba(0, 0, 0, 0.87)',
    textDecoration: 'none'
  },
  '& a:visited': {
    color: 'rgba(0, 0, 0, 0.87)'
  },
  '& h6': {
    lineHeight: theme.spacing(3)
  },
  '& svg': {
    color: theme.palette.secondary.main
  },
  '&:hover, &:focus': {
    backgroundColor: alpha(theme.palette.secondary.light, 0.3)
  }
}))

export default ImageGrid
