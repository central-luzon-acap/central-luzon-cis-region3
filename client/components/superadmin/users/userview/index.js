import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import styles from './styles'

const headersFormat = {
  email: 'Email',
  displayName: 'Display Name',
  acclevel: 'Acc. Type',
  emailVerified: 'Email Verified',
  disabled: 'Acc. Disabled',
  last_signin: 'Last Signin',
}

function UserView ({ userinfo }) {
  return (
    <Box>
      {Object.keys(headersFormat).map(header => (
        <Box sx={styles.infoRow} key={header}>
          <div>{headersFormat[header]}</div>
          <div>{userinfo[header].toString()}</div>
        </Box>
      ))}
    </Box>
  )
}

UserView.propTypes = {
  /** User infomation from a DataGrid row */
  userinfo: PropTypes.object,
}

export default UserView
