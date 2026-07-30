import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import styles from './styles'

function UserForm ({
  state,
  loadstatus,
  onTextChange,
  type = 'create',
  inputValidation,
  handleInputClick,
}) {
  return (
    <Box
      component='form'
      noValidate
      autoComplete='off'
      sx={styles.container}
    >
      {type !== 'create' &&
        <TextField
          id='uid'
          label='Enter UID'
          variant='standard'
          size='small'
          disabled
          value={state.uid}
        />
      }

      <TextField
        id='email'
        label='Enter email'
        variant='standard'
        size='small'
        error={inputValidation.email !== ''}
        helperText={
          inputValidation.email !== ''
            ? inputValidation.email
            : ''
          }
        disabled={loadstatus.isLoading}
        value={state.email}
        onChange={onTextChange}
        onClick={handleInputClick}
      />

      <TextField
        id='displayname'
        label='Enter display name'
        variant='standard'
        size='small'
        error={inputValidation.displayname !== ''}
        helperText={
          inputValidation.displayname !== ''
            ? inputValidation.displayname
            : ''
          }
        disabled={loadstatus.isLoading}
        value={state.displayname}
        onChange={onTextChange}
        onClick={handleInputClick}
      />

      <TextField
        id='password'
        label='Enter password'
        type='password'
        placeholder={state.mode === 'create'
          ? 'Enter password'
          : 'Password will not be updated if left blank' }
        variant='standard'
        size='small'
        error={inputValidation.password !== '' && type === 'create'}
        helperText={
          inputValidation.password !== '' && type === 'create'
            ? inputValidation.password
            : ''
          }
        disabled={loadstatus.isLoading}
        value={state.password}
        onChange={onTextChange}
        onClick={handleInputClick}
      />

      <InputLabel
        sx={styles.formlabel}
        id='accountlevel-label'
      >
        Account Type
      </InputLabel>

      <Select
        labelId='accountlevel-label'
        id='account_level'
        size='small'
        sx={styles.selectBox}
        disabled={loadstatus.isLoading}
        value={state.account_level}
        onChange={onTextChange}
      >
        <MenuItem value={1} size='small'>Superadmin</MenuItem>
        <MenuItem value={2} size='small'>Admin</MenuItem>
      </Select>

      <FormControlLabel control={
        <Switch
          checked={state.disabled}
          disabled={loadstatus.isLoading}
          id='disabled' name='disabled'
          onChange={onTextChange} />}
          label="Account Disabled"
        />

      <FormControlLabel control={
        <Switch
          checked={state.emailverified}
          disabled={loadstatus.isLoading}
          id='emailverified'
          name='emailverified'
          onChange={onTextChange} />}
          label="Email Verified"
        />
    </Box>
  )
}

UserForm.propTypes = {
  /** State of the input fields */
  state: PropTypes.object,
  /** Remote data loading, error and success information */
  loadstatus: PropTypes.object,
  /** Saves user input to its local state */
  onTextChange: PropTypes.func,
  /** Indicates if UserForm is for "create" or "update" mode */
  type: PropTypes.string,
  /** Object[] with simple validation messages for each input field (state) */
  inputValidation: PropTypes.object,
  /** Clears input fields on click */
  handleInputClick: PropTypes.func,
}

export default UserForm
