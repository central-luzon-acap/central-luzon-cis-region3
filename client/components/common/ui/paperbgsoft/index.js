import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

// Slightly embossed white Paper background
const PaperBgSoft = styled((props) => {
  return <Paper {...props} />
})(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: '#fff',
  boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
  border: `1px solid ${theme.palette.bacap.border}`
}))

export default PaperBgSoft
