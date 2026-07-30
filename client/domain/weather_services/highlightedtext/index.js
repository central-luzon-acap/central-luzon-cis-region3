import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const HighlightedBox = styled((props) => {
  return <Box {...props} />
  /* eslint-disable no-unused-vars */
})(({ theme }) => ({
  backgroundColor: '#ff7e79',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  textAlign: 'center',
  padding: '8px 0 8px 0'
}))

export default HighlightedBox
