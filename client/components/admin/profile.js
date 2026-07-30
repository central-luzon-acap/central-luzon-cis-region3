import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import ModalDialogWrapper from '@/common/ui/modal'
import SimpleSnackbar from '@/common/ui/snackbar'
import styles from './styles'

function Profile ({
  user,
  password,
  message,
  handleUpdateUser,
  handleUpdatePassword,
  handleSaveSuccess,
  togglePrompt
}) {
  const orderedKeys = {
    uid: 'UID',
    accountlevel: 'Account Level',
    email: 'Email',
    name: 'Display Name',
    password: 'Enter a new password'
  }

  return (
    <Card sx={styles.profileCard}>
      {/** Confirm Save Password Modal Dialog */}
      <ModalDialogWrapper
        isOpen={message.isOpen}
        maxWidth='xs'
        openButtonText={null}
        title={message.title}
        contentText={message.msg}
        loading={message.loading}
        cancelBtnText={null}
        modalCancelHandlerCB={() => {
          if (message.savesuccess) {
            handleSaveSuccess()
          } else {
            togglePrompt()
          }
        }}
        modalConfirmHandlerCB={() => {
          if (message.savesuccess) {
            handleSaveSuccess()
          } else {
            handleUpdatePassword()
          }
        }}
      />

      <SimpleSnackbar
        openSnackbar={message.error !== ''}
        message={message.error}
        severity='warning'
      />

      <CardContent sx={styles.profileContainer}>
        <Typography variant='h5'>Profile Information</Typography>
        <br />

        {(user !== undefined && user !== null) &&
          Object.keys(orderedKeys).map((item, index) => {
            let value = user[item]

            if (['accountlevel'].includes(item)) {
              value = parseInt(user[item]) === 2 ? 'Admin' : 'Superadmin'
            }

            if (item === 'password') {
              value = password
            }

            return <TextField
              sx={styles.textfield}
              key={`${item}-${index}`}
              size='small'
              disabled={['uid', 'accountlevel'].includes(item)}
              id={item}
              label={orderedKeys[item]}
              variant='outlined'
              value={value}
              onChange={handleUpdateUser}
            />
          })}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              disableElevation
              variant='contained'
              sx={styles.button}
              onClick={togglePrompt}
            >
              Update Password
            </Button>
          </Box>
      </CardContent>

      {/** Display the signed-in user's access token */}
      {process.env.NODE_ENV === 'development' &&
      <div style={{ padding: '16px', fontSize: '12px' }}>
        <h3>Access Token</h3>
        {user?.accessToken}
      </div>
      }
    </Card>
  )
}

export default Profile
