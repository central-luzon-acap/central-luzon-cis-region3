import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import LoadingCover from '@/common/ui/loadingcover'
import Typography from '@mui/material/Typography'
import SettingsIcon from '@mui/icons-material/Settings'
import styles from './styles'

function Login (props) {
  const { loading, hasUser, state, loginTitle } = props
  const { onInputChange, onInputClick, onBtnClick } = props

  return (
    <div>
      {loading && <LoadingCover />}
      {(!loading && !hasUser) &&
        <Box sx={styles.container} id='bacap-login'>
          <Box
            component='form'
            noValidate
            autoComplete='off'
            sx={styles.loginContainer}
          >
            {loginTitle === 'Superadmin' &&
              <SettingsIcon color='primary' size='large' />
            }

            <Typography variant='h5'>ACAP <br />
              {loginTitle
                ? loginTitle
                : 'Admin'
              } Login
            </Typography>

            <TextField
              error={state.error !== ''}
              id='email'
              label='Enter email'
              variant='outlined'
              value={state.email}
              onChange={onInputChange}
              onClick={onInputClick}
            />

            <TextField
              error={state.error !== ''}
              id='password'
              label='Enter password'
              type='password'
              variant='outlined'
              value={state.password}
              onChange={onInputChange}
              onClick={onInputClick}
              helperText={state.error}
            />

            <Button
              variant='contained'
              size='large'
              onClick={onBtnClick}
            >Log in
            </Button>
          </Box>
        </Box>
      }
    </div>
  )
}

export default Login
