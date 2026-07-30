import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

// Embossed white Paper background
const PaperBg = styled((props) => {
  return <Paper {...props} />
})(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
}))

export default PaperBg
