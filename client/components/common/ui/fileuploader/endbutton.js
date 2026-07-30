import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const EndButton = styled((props) => (
  <Button {...props} />
))(({ theme }) => ({
  width: '150px',
  height: theme.spacing(5)
}))

export default EndButton
