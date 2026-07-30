import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'

const FileInput = styled((props) => (
  <TextField {...props} />
))(({ theme }) => ({
  width: '100%',
  fontSize: '12px',
  marginTop: theme.spacing(1),
  '& .MuiOutlinedInput-root': {
    paddingRight: 0,
    paddingLeft: 0
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1)
  }
}))

export default FileInput
